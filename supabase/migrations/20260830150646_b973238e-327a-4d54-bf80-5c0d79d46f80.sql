create or replace function public.ai_quota_for_tier(_tier text)
returns table (max_calls integer, max_cost numeric)
language sql
immutable
set search_path = public
as $$
  select case _tier when 'premium' then 60 when 'standard' then 20 else 3 end,
         case _tier when 'premium' then 30.0 when 'standard' then 10.0 else 1.5 end;
$$;

revoke all on function public.ai_quota_for_tier(text) from public;
revoke all on function public.ai_quota_for_tier(text) from anon;
revoke all on function public.consume_ai_quota(numeric) from anon;
grant execute on function public.ai_quota_for_tier(text) to authenticated, service_role;
grant execute on function public.consume_ai_quota(numeric) to authenticated;