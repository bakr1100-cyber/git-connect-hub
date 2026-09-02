alter table public.ai_usage add column if not exists last_call_at timestamptz;

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
  last_at timestamptz;
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

  select u.calls, u.cost_units, u.last_call_at into used_calls, used_cost, last_at
  from public.ai_usage u
  where u.user_id = uid and u.usage_date = ((now() at time zone 'utc')::date)
  for update;

  if last_at is not null and now() - last_at < interval '3 seconds' then
    return jsonb_build_object(
      'allowed', false, 'reason', 'too_fast', 'tier', user_tier,
      'used', used_calls, 'limit', cap_calls,
      'remaining', greatest(cap_calls - used_calls, 0)
    );
  end if;

  if used_calls >= cap_calls or (used_cost + _cost) > cap_cost then
    return jsonb_build_object(
      'allowed', false, 'reason', 'limit_reached', 'tier', user_tier,
      'used', used_calls, 'limit', cap_calls, 'remaining', 0
    );
  end if;

  update public.ai_usage
  set calls = calls + 1,
      cost_units = cost_units + _cost,
      last_call_at = now(),
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
revoke all on function public.consume_ai_quota(numeric) from anon;
grant execute on function public.consume_ai_quota(numeric) to authenticated;