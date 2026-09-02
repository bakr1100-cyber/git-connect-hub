-- Server-side truth for a user's paid tier (payments write here later).
create table if not exists public.user_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tier text not null default 'free' check (tier in ('free','standard','premium')),
  updated_at timestamptz not null default now()
);

grant select on public.user_entitlements to authenticated;
grant all on public.user_entitlements to service_role;

alter table public.user_entitlements enable row level security;

create policy "Users read own entitlements"
  on public.user_entitlements for select to authenticated
  using (auth.uid() = user_id);

-- Per-user, per-day AI usage counters (calls + estimated cost units).
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default ((now() at time zone 'utc')::date),
  calls integer not null default 0,
  cost_units numeric(12,4) not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);

grant select on public.ai_usage to authenticated;
grant all on public.ai_usage to service_role;

alter table public.ai_usage enable row level security;

create policy "Users read own ai usage"
  on public.ai_usage for select to authenticated
  using (auth.uid() = user_id);

-- Daily caps per tier: calls and estimated cost units.
create or replace function public.ai_quota_for_tier(_tier text)
returns table (max_calls integer, max_cost numeric)
language sql
immutable
as $$
  select case _tier when 'premium' then 60 when 'standard' then 20 else 3 end,
         case _tier when 'premium' then 30.0 when 'standard' then 10.0 else 1.5 end;
$$;

-- Atomically checks and consumes a user's daily AI quota.
create or replace function public.consume_ai_quota(_cost numeric default 1)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  user_tier text;
  cap_calls integer;
  cap_cost numeric;
  used_calls integer;
  used_cost numeric;
begin
  if uid is null then
    return jsonb_build_object('allowed', false, 'reason', 'unauthenticated');
  end if;

  _cost := greatest(coalesce(_cost, 1), 0);

  select coalesce(e.tier, 'free') into user_tier
  from (select 1) x
  left join public.user_entitlements e on e.user_id = uid;

  select q.max_calls, q.max_cost into cap_calls, cap_cost
  from public.ai_quota_for_tier(coalesce(user_tier, 'free')) q;

  insert into public.ai_usage (user_id) values (uid)
  on conflict (user_id, usage_date) do nothing;

  select u.calls, u.cost_units into used_calls, used_cost
  from public.ai_usage u
  where u.user_id = uid and u.usage_date = ((now() at time zone 'utc')::date)
  for update;

  if used_calls >= cap_calls or (used_cost + _cost) > cap_cost then
    return jsonb_build_object(
      'allowed', false, 'reason', 'limit_reached', 'tier', user_tier,
      'used', used_calls, 'limit', cap_calls, 'remaining', 0
    );
  end if;

  update public.ai_usage
  set calls = calls + 1,
      cost_units = cost_units + _cost,
      updated_at = now()
  where user_id = uid and usage_date = ((now() at time zone 'utc')::date);

  return jsonb_build_object(
    'allowed', true, 'tier', user_tier,
    'used', used_calls + 1, 'limit', cap_calls,
    'remaining', cap_calls - (used_calls + 1)
  );
end;
$$;

revoke all on function public.consume_ai_quota(numeric) from public;
grant execute on function public.consume_ai_quota(numeric) to authenticated;
grant execute on function public.ai_quota_for_tier(text) to authenticated, service_role;