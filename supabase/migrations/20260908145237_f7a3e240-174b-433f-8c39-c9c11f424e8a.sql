do $$ begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin','moderator','user');
  end if;
end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

drop policy if exists "Users read own roles" on public.user_roles;
create policy "Users read own roles" on public.user_roles
for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- packages: admin full manage
grant select, insert, update, delete on public.packages to authenticated;
drop policy if exists "Admins manage packages" on public.packages;
create policy "Admins manage packages" on public.packages
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- purchases
grant select, insert, update, delete on public.purchases to authenticated;
drop policy if exists "Admins manage purchases" on public.purchases;
create policy "Admins manage purchases" on public.purchases
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- entitlements
grant select, insert, update, delete on public.user_entitlements to authenticated;
drop policy if exists "Admins manage entitlements" on public.user_entitlements;
create policy "Admins manage entitlements" on public.user_entitlements
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- ai usage
grant select, insert, update, delete on public.ai_usage to authenticated;
drop policy if exists "Admins manage ai usage" on public.ai_usage;
create policy "Admins manage ai usage" on public.ai_usage
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- admin overview of users
create or replace view public.admin_users_view
with (security_invoker = true) as
select u.id as user_id,
       u.email::text as email,
       u.created_at,
       u.last_sign_in_at,
       e.tier,
       e.expires_at
from auth.users u
left join public.user_entitlements e on e.user_id = u.id;

revoke all on public.admin_users_view from anon, authenticated;

insert into public.user_roles (user_id, role)
values ('f0e40a66-5e34-4abb-b358-e678ba142d05', 'admin')
on conflict do nothing;