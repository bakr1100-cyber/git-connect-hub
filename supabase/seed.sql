-- Local development seed data.
-- Runs automatically with `supabase db reset` (never against the cloud project).

-- Demo user: demo@mycvonline.local / demo1234
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'demo@mycvonline.local',
  crypt('demo1234', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}'
) on conflict (id) do nothing;

insert into auth.identities (
  id, user_id, provider_id, provider, identity_data, created_at, updated_at
) values (
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'email',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"demo@mycvonline.local","email_verified":true}',
  now(), now()
) on conflict do nothing;

-- Profile
insert into public.applicant_profiles (user_id, first_name, last_name, email, city, country, target_position)
values ('11111111-1111-1111-1111-111111111111', 'Demo', 'Nutzer', 'demo@mycvonline.local', 'Berlin', 'Deutschland', 'Projektmanager')
on conflict (user_id) do nothing;

-- Active package + receipt
insert into public.user_entitlements (user_id, tier, expires_at)
values ('11111111-1111-1111-1111-111111111111', 'premium', now() + interval '30 days')
on conflict (user_id) do update set tier = excluded.tier, expires_at = excluded.expires_at;

insert into public.purchases (user_id, invoice_no, tier, status, amount_cents, currency, purchased_at, expires_at, email_sent)
values ('11111111-1111-1111-1111-111111111111', 'INV-LOCAL-0001', 'premium', 'active', 1490, 'EUR', now(), now() + interval '30 days', true)
on conflict do nothing;

-- AI usage for today
insert into public.ai_usage (user_id, calls, cost_units)
values ('11111111-1111-1111-1111-111111111111', 5, 2.5)
on conflict (user_id, usage_date) do nothing;

-- Admin-Rolle für den lokalen Demo-Nutzer, damit /admin lokal nutzbar ist.
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role from auth.users where email = 'demo@mycvonline.local'
on conflict do nothing;
