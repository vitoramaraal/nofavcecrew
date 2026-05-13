-- NoFvce Crew MVP schema
-- Run this in the Supabase SQL editor for the project used by frontend/.env.

create extension if not exists pgcrypto;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  instagram text not null,
  whatsapp text not null,
  car_model text not null,
  car_setup text,
  message text,
  image_name text,
  image_url text,
  image_path text,
  member_photo_url text,
  member_photo_path text,
  identity_rule_confirmed boolean not null default false,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.applications
  add column if not exists identity_rule_confirmed boolean not null default false;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id) on delete set null,
  full_name text not null,
  instagram text,
  whatsapp text,
  car_model text,
  car_setup text,
  image_url text,
  member_photo_url text,
  member_photo_path text,
  role text not null default 'member'
    check (role in ('founder', 'admin', 'moderator', 'member')),
  access_code text unique not null,
  status text not null default 'active'
    check (status in ('active', 'inactive')),
  member_number text unique not null,
  created_at timestamptz not null default now()
);

alter table public.members
  add column if not exists role text;

alter table public.members
  add column if not exists access_code text;

alter table public.members
  alter column role set default 'member';

update public.members
set role = 'member'
where role is null;

update public.members
set access_code = concat('LEGACY-', upper(substr(id::text, 1, 8)))
where access_code is null;

alter table public.members
  alter column role set not null;

alter table public.members
  alter column access_code set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'members_role_check'
  ) then
    alter table public.members
      add constraint members_role_check
      check (role in ('founder', 'admin', 'moderator', 'member'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'members_access_code_key'
  ) then
    alter table public.members
      add constraint members_access_code_key unique (access_code);
  end if;
end $$;

create index if not exists applications_status_created_at_idx
  on public.applications (status, created_at desc);

create index if not exists members_status_created_at_idx
  on public.members (status, created_at desc);

create index if not exists members_access_code_idx
  on public.members (access_code);

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'admin'
    check (role in ('founder', 'admin', 'moderator')),
  created_at timestamptz not null default now()
);

alter table public.admin_users
  drop constraint if exists admin_users_role_check;

alter table public.admin_users
  add constraint admin_users_role_check
  check (role in ('founder', 'admin', 'moderator'));

create or replace function public.current_admin_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select admin_users.role
  from public.admin_users
  where admin_users.id = auth.uid()
  limit 1;
$$;

grant execute on function public.current_admin_role() to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    public.current_admin_role() in ('founder', 'admin', 'moderator'),
    false
  );
$$;

grant execute on function public.is_admin() to authenticated;

create or replace function public.can_review_applications()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    public.current_admin_role() in ('founder', 'admin', 'moderator'),
    false
  );
$$;

grant execute on function public.can_review_applications() to authenticated;

create or replace function public.can_manage_members()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(public.current_admin_role() in ('founder', 'admin'), false);
$$;

grant execute on function public.can_manage_members() to authenticated;

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_created_at_idx
  on public.chat_messages (created_at desc);

create index if not exists chat_messages_member_id_idx
  on public.chat_messages (member_id);

insert into storage.buckets (id, name, public)
values ('application-photos', 'application-photos', true)
on conflict (id) do update set public = excluded.public;

alter table public.applications enable row level security;
alter table public.members enable row level security;
alter table public.admin_users enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "Admins can read admin users" on public.admin_users;
create policy "Admins can read admin users"
  on public.admin_users
  for select
  to authenticated
  using (public.can_review_applications());

drop policy if exists "Public can create applications" on public.applications;
create policy "Public can create applications"
  on public.applications
  for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and identity_rule_confirmed = true
  );

drop policy if exists "Public can upload application photos" on storage.objects;
create policy "Public can upload application photos"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'application-photos');

drop policy if exists "Public can read application photos" on storage.objects;
create policy "Public can read application photos"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'application-photos');

drop policy if exists "Prototype admin can read applications" on public.applications;
drop policy if exists "Prototype admin can update applications" on public.applications;
drop policy if exists "Prototype admin can delete applications" on public.applications;
drop policy if exists "Admins can read applications" on public.applications;
create policy "Admins can read applications"
  on public.applications
  for select
  to authenticated
  using (public.can_review_applications());

drop policy if exists "Admins can update applications" on public.applications;
create policy "Admins can update applications"
  on public.applications
  for update
  to authenticated
  using (public.can_review_applications())
  with check (
    public.can_review_applications()
    and status in ('pending', 'approved', 'rejected')
  );

drop policy if exists "Admins can delete applications" on public.applications;
create policy "Admins can delete applications"
  on public.applications
  for delete
  to authenticated
  using (public.can_manage_members());

drop policy if exists "Prototype admin can create members" on public.members;
drop policy if exists "Prototype admin can read members" on public.members;
drop policy if exists "Prototype admin can update members" on public.members;
drop policy if exists "Prototype admin can delete members" on public.members;
drop policy if exists "Admins can create members" on public.members;
create policy "Admins can create members"
  on public.members
  for insert
  to authenticated
  with check (
    (
      public.can_manage_members()
      and status in ('active', 'inactive')
      and role in ('founder', 'admin', 'moderator', 'member')
    )
    or
    (
      public.current_admin_role() = 'moderator'
      and status = 'active'
      and role = 'member'
    )
  );

drop policy if exists "Admins can read members" on public.members;
create policy "Admins can read members"
  on public.members
  for select
  to authenticated
  using (public.can_review_applications());

drop policy if exists "Admins can update members" on public.members;
create policy "Admins can update members"
  on public.members
  for update
  to authenticated
  using (public.can_manage_members())
  with check (
    public.can_manage_members()
    and status in ('active', 'inactive')
    and role in ('founder', 'admin', 'moderator', 'member')
  );

drop policy if exists "Admins can delete members" on public.members;
create policy "Admins can delete members"
  on public.members
  for delete
  to authenticated
  using (public.can_manage_members());

drop policy if exists "Members can read chat messages" on public.chat_messages;
drop policy if exists "Members can create chat messages" on public.chat_messages;
drop policy if exists "Admins can read chat messages" on public.chat_messages;
create policy "Admins can read chat messages"
  on public.chat_messages
  for select
  to authenticated
  using (public.can_review_applications());

drop policy if exists "Admins can delete chat messages" on public.chat_messages;
create policy "Admins can delete chat messages"
  on public.chat_messages
  for delete
  to authenticated
  using (public.can_review_applications());

grant insert on public.applications to anon;
grant select, insert, update, delete on public.applications to authenticated;
grant select, insert, update, delete on public.members to authenticated;
grant select on public.admin_users to authenticated;
grant select, delete on public.chat_messages to authenticated;

create or replace function public.authenticate_member(secret_code text)
returns table (
  id uuid,
  full_name text,
  instagram text,
  car_model text,
  car_setup text,
  image_url text,
  member_photo_url text,
  member_photo_path text,
  role text,
  member_number text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    members.id,
    members.full_name,
    members.instagram,
    members.car_model,
    members.car_setup,
    members.image_url,
    members.member_photo_url,
    members.member_photo_path,
    members.role,
    members.member_number,
    members.created_at
  from public.members
  where members.status = 'active'
    and members.access_code = secret_code
  limit 1;
$$;

grant execute on function public.authenticate_member(text) to anon, authenticated;

create or replace function public.list_active_members()
returns table (
  id uuid,
  application_id uuid,
  full_name text,
  instagram text,
  car_model text,
  car_setup text,
  image_url text,
  member_photo_url text,
  member_photo_path text,
  status text,
  role text,
  member_number text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    members.id,
    members.application_id,
    members.full_name,
    members.instagram,
    members.car_model,
    members.car_setup,
    members.image_url,
    members.member_photo_url,
    members.member_photo_path,
    members.status,
    members.role,
    members.member_number,
    members.created_at
  from public.members
  where members.status = 'active'
  order by members.created_at desc;
$$;

grant execute on function public.list_active_members() to anon, authenticated;

create or replace function public.get_member_profile(member_id uuid)
returns table (
  id uuid,
  application_id uuid,
  full_name text,
  instagram text,
  car_model text,
  car_setup text,
  image_url text,
  member_photo_url text,
  member_photo_path text,
  role text,
  member_number text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    members.id,
    members.application_id,
    members.full_name,
    members.instagram,
    members.car_model,
    members.car_setup,
    members.image_url,
    members.member_photo_url,
    members.member_photo_path,
    members.role,
    members.member_number,
    members.created_at
  from public.members
  where members.id = member_id
    and members.status = 'active'
  limit 1;
$$;

grant execute on function public.get_member_profile(uuid) to anon, authenticated;

create or replace function public.verify_member(member_id uuid)
returns table (
  id uuid,
  full_name text,
  instagram text,
  car_model text,
  role text,
  member_number text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    members.id,
    members.full_name,
    members.instagram,
    members.car_model,
    members.role,
    members.member_number,
    members.created_at
  from public.members
  where members.id = member_id
    and members.status = 'active'
  limit 1;
$$;

grant execute on function public.verify_member(uuid) to anon, authenticated;

create or replace function public.list_chat_messages()
returns table (
  id uuid,
  member_id uuid,
  body text,
  created_at timestamptz,
  member_full_name text,
  member_number text,
  member_role text
)
language sql
security definer
set search_path = public
as $$
  select
    chat_messages.id,
    chat_messages.member_id,
    chat_messages.body,
    chat_messages.created_at,
    members.full_name as member_full_name,
    members.member_number,
    members.role as member_role
  from public.chat_messages
  join public.members on members.id = chat_messages.member_id
  where members.status = 'active'
  order by chat_messages.created_at asc
  limit 100;
$$;

grant execute on function public.list_chat_messages() to anon, authenticated;

create or replace function public.create_chat_message(
  active_member_id uuid,
  message_body text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_body text := trim(coalesce(message_body, ''));
  created_message_id uuid;
begin
  if char_length(normalized_body) < 1
    or char_length(normalized_body) > 500 then
    raise exception 'Chat message must be between 1 and 500 characters.';
  end if;

  if not exists (
    select 1
    from public.members
    where members.id = active_member_id
      and members.status = 'active'
  ) then
    raise exception 'Active member not found.';
  end if;

  insert into public.chat_messages (member_id, body)
  values (active_member_id, normalized_body)
  returning id into created_message_id;

  return created_message_id;
end;
$$;

grant execute on function public.create_chat_message(uuid, text) to anon, authenticated;
