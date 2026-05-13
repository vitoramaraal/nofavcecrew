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
  bio text,
  car_specs text,
  car_mods text,
  gallery_urls jsonb not null default '[]'::jsonb,
  image_url text,
  member_photo_url text,
  member_photo_path text,
  role text not null default 'member'
    check (role in ('founder', 'admin', 'moderator', 'member')),
  access_code text unique not null,
  status text not null default 'active'
    check (status in ('active', 'inactive')),
  member_number text unique not null,
  profile_updated_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.members
  add column if not exists role text;

alter table public.members
  add column if not exists access_code text;

alter table public.members
  add column if not exists bio text;

alter table public.members
  add column if not exists car_specs text;

alter table public.members
  add column if not exists car_mods text;

alter table public.members
  add column if not exists gallery_urls jsonb not null default '[]'::jsonb;

alter table public.members
  add column if not exists profile_updated_at timestamptz;

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

create table if not exists public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  body text not null default '' check (char_length(body) <= 700),
  image_urls jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists feed_posts_created_at_idx
  on public.feed_posts (created_at desc);

create index if not exists feed_posts_member_id_idx
  on public.feed_posts (member_id);

create table if not exists public.feed_likes (
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, member_id)
);

create index if not exists feed_likes_member_id_idx
  on public.feed_likes (member_id);

create table if not exists public.feed_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 400),
  created_at timestamptz not null default now()
);

create index if not exists feed_comments_post_id_created_at_idx
  on public.feed_comments (post_id, created_at asc);

create index if not exists feed_comments_member_id_idx
  on public.feed_comments (member_id);

insert into storage.buckets (id, name, public)
values ('application-photos', 'application-photos', true)
on conflict (id) do update set public = excluded.public;

alter table public.applications enable row level security;
alter table public.members enable row level security;
alter table public.admin_users enable row level security;
alter table public.chat_messages enable row level security;
alter table public.feed_posts enable row level security;
alter table public.feed_likes enable row level security;
alter table public.feed_comments enable row level security;

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

drop policy if exists "Admins can read feed posts" on public.feed_posts;
create policy "Admins can read feed posts"
  on public.feed_posts
  for select
  to authenticated
  using (public.can_review_applications());

drop policy if exists "Admins can delete feed posts" on public.feed_posts;
create policy "Admins can delete feed posts"
  on public.feed_posts
  for delete
  to authenticated
  using (public.can_review_applications());

drop policy if exists "Admins can read feed likes" on public.feed_likes;
create policy "Admins can read feed likes"
  on public.feed_likes
  for select
  to authenticated
  using (public.can_review_applications());

drop policy if exists "Admins can read feed comments" on public.feed_comments;
create policy "Admins can read feed comments"
  on public.feed_comments
  for select
  to authenticated
  using (public.can_review_applications());

drop policy if exists "Admins can delete feed comments" on public.feed_comments;
create policy "Admins can delete feed comments"
  on public.feed_comments
  for delete
  to authenticated
  using (public.can_review_applications());

grant insert on public.applications to anon;
grant select, insert, update, delete on public.applications to authenticated;
grant select, insert, update, delete on public.members to authenticated;
grant select on public.admin_users to authenticated;
grant select, delete on public.chat_messages to authenticated;
grant select, delete on public.feed_posts to authenticated;
grant select on public.feed_likes to authenticated;
grant select, delete on public.feed_comments to authenticated;

create or replace function public.authenticate_member(secret_code text)
returns table (
  id uuid,
  full_name text,
  instagram text,
  car_model text,
  car_setup text,
  bio text,
  car_specs text,
  car_mods text,
  gallery_urls jsonb,
  image_url text,
  member_photo_url text,
  member_photo_path text,
  role text,
  member_number text,
  profile_updated_at timestamptz,
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
    members.bio,
    members.car_specs,
    members.car_mods,
    members.gallery_urls,
    members.image_url,
    members.member_photo_url,
    members.member_photo_path,
    members.role,
    members.member_number,
    members.profile_updated_at,
    members.created_at
  from public.members
  where members.status = 'active'
    and members.access_code = secret_code
  limit 1;
$$;

grant execute on function public.authenticate_member(text) to anon, authenticated;

drop function if exists public.list_active_members();

create or replace function public.list_active_members(
  active_member_id uuid,
  secret_code text
)
returns table (
  id uuid,
  application_id uuid,
  full_name text,
  instagram text,
  car_model text,
  car_setup text,
  bio text,
  car_specs text,
  car_mods text,
  gallery_urls jsonb,
  image_url text,
  member_photo_url text,
  member_photo_path text,
  status text,
  role text,
  member_number text,
  profile_updated_at timestamptz,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  with active_session as (
    select members.id
    from public.members
    where members.id = active_member_id
      and members.status = 'active'
      and members.access_code = secret_code
    limit 1
  )
  select
    members.id,
    members.application_id,
    members.full_name,
    members.instagram,
    members.car_model,
    members.car_setup,
    members.bio,
    members.car_specs,
    members.car_mods,
    members.gallery_urls,
    members.image_url,
    members.member_photo_url,
    members.member_photo_path,
    members.status,
    members.role,
    members.member_number,
    members.profile_updated_at,
    members.created_at
  from public.members
  cross join active_session
  where members.status = 'active'
  order by members.created_at desc;
$$;

grant execute on function public.list_active_members(uuid, text)
  to anon, authenticated;

create or replace function public.get_member_profile(member_id uuid)
returns table (
  id uuid,
  application_id uuid,
  full_name text,
  instagram text,
  car_model text,
  car_setup text,
  bio text,
  car_specs text,
  car_mods text,
  gallery_urls jsonb,
  image_url text,
  member_photo_url text,
  member_photo_path text,
  role text,
  member_number text,
  profile_updated_at timestamptz,
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
    members.bio,
    members.car_specs,
    members.car_mods,
    members.gallery_urls,
    members.image_url,
    members.member_photo_url,
    members.member_photo_path,
    members.role,
    members.member_number,
    members.profile_updated_at,
    members.created_at
  from public.members
  where members.id = member_id
    and members.status = 'active'
  limit 1;
$$;

grant execute on function public.get_member_profile(uuid) to authenticated;

create or replace function public.validate_member_session(
  active_member_id uuid,
  secret_code text
)
returns table (
  id uuid,
  application_id uuid,
  full_name text,
  instagram text,
  car_model text,
  car_setup text,
  bio text,
  car_specs text,
  car_mods text,
  gallery_urls jsonb,
  image_url text,
  member_photo_url text,
  member_photo_path text,
  role text,
  member_number text,
  profile_updated_at timestamptz,
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
    members.bio,
    members.car_specs,
    members.car_mods,
    members.gallery_urls,
    members.image_url,
    members.member_photo_url,
    members.member_photo_path,
    members.role,
    members.member_number,
    members.profile_updated_at,
    members.created_at
  from public.members
  where members.id = active_member_id
    and members.status = 'active'
    and members.access_code = secret_code
  limit 1;
$$;

grant execute on function public.validate_member_session(uuid, text)
  to anon, authenticated;

create or replace function public.update_member_profile(
  active_member_id uuid,
  secret_code text,
  profile_bio text,
  profile_instagram text,
  profile_car_model text,
  profile_car_setup text,
  profile_car_specs text,
  profile_car_mods text,
  profile_gallery_urls jsonb
)
returns table (
  id uuid,
  application_id uuid,
  full_name text,
  instagram text,
  car_model text,
  car_setup text,
  bio text,
  car_specs text,
  car_mods text,
  gallery_urls jsonb,
  image_url text,
  member_photo_url text,
  member_photo_path text,
  role text,
  member_number text,
  profile_updated_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_gallery jsonb := coalesce(profile_gallery_urls, '[]'::jsonb);
begin
  if jsonb_typeof(normalized_gallery) <> 'array' then
    raise exception 'Gallery must be an array.';
  end if;

  if jsonb_array_length(normalized_gallery) > 6 then
    raise exception 'Gallery can have at most 6 images.';
  end if;

  return query
  update public.members
  set
    bio = nullif(left(trim(coalesce(profile_bio, '')), 500), ''),
    instagram = nullif(left(trim(coalesce(profile_instagram, '')), 31), ''),
    car_model = nullif(left(trim(coalesce(profile_car_model, '')), 80), ''),
    car_setup = nullif(left(trim(coalesce(profile_car_setup, '')), 700), ''),
    car_specs = nullif(left(trim(coalesce(profile_car_specs, '')), 700), ''),
    car_mods = nullif(left(trim(coalesce(profile_car_mods, '')), 700), ''),
    gallery_urls = normalized_gallery,
    profile_updated_at = now()
  where members.id = active_member_id
    and members.status = 'active'
    and members.access_code = secret_code
  returning
    members.id,
    members.application_id,
    members.full_name,
    members.instagram,
    members.car_model,
    members.car_setup,
    members.bio,
    members.car_specs,
    members.car_mods,
    members.gallery_urls,
    members.image_url,
    members.member_photo_url,
    members.member_photo_path,
    members.role,
    members.member_number,
    members.profile_updated_at,
    members.created_at;

  if not found then
    raise exception 'Active member not found.';
  end if;
end;
$$;

grant execute on function public.update_member_profile(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb
) to anon, authenticated;

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

drop function if exists public.list_chat_messages();

create or replace function public.list_chat_messages(
  active_member_id uuid,
  secret_code text
)
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
  with active_session as (
    select members.id
    from public.members
    where members.id = active_member_id
      and members.status = 'active'
      and members.access_code = secret_code
    limit 1
  )
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
  cross join active_session
  where members.status = 'active'
  order by chat_messages.created_at asc
  limit 100;
$$;

grant execute on function public.list_chat_messages(uuid, text)
  to anon, authenticated;

drop function if exists public.create_chat_message(uuid, text);

create or replace function public.create_chat_message(
  active_member_id uuid,
  secret_code text,
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
      and members.access_code = secret_code
  ) then
    raise exception 'Active member not found.';
  end if;

  insert into public.chat_messages (member_id, body)
  values (active_member_id, normalized_body)
  returning id into created_message_id;

  return created_message_id;
end;
$$;

grant execute on function public.create_chat_message(uuid, text, text)
  to anon, authenticated;

create or replace function public.list_feed_posts(
  active_member_id uuid,
  secret_code text
)
returns table (
  id uuid,
  member_id uuid,
  body text,
  image_urls jsonb,
  created_at timestamptz,
  author_name text,
  author_member_number text,
  author_role text,
  author_car_model text,
  author_member_photo_url text,
  like_count bigint,
  comment_count bigint,
  liked_by_current_member boolean,
  comments jsonb
)
language sql
security definer
set search_path = public
as $$
  with active_session as (
    select members.id
    from public.members
    where members.id = active_member_id
      and members.status = 'active'
      and members.access_code = secret_code
    limit 1
  )
  select
    feed_posts.id,
    feed_posts.member_id,
    feed_posts.body,
    feed_posts.image_urls,
    feed_posts.created_at,
    members.full_name as author_name,
    members.member_number as author_member_number,
    members.role as author_role,
    members.car_model as author_car_model,
    members.member_photo_url as author_member_photo_url,
    (
      select count(*)
      from public.feed_likes
      where feed_likes.post_id = feed_posts.id
    ) as like_count,
    (
      select count(*)
      from public.feed_comments
      where feed_comments.post_id = feed_posts.id
    ) as comment_count,
    exists (
      select 1
      from public.feed_likes
      where feed_likes.post_id = feed_posts.id
        and feed_likes.member_id = active_member_id
    ) as liked_by_current_member,
    (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', feed_comments.id,
            'member_id', feed_comments.member_id,
            'body', feed_comments.body,
            'created_at', feed_comments.created_at,
            'author_name', comment_members.full_name,
            'author_member_number', comment_members.member_number,
            'author_role', comment_members.role
          )
          order by feed_comments.created_at asc
        ),
        '[]'::jsonb
      )
      from public.feed_comments
      join public.members as comment_members
        on comment_members.id = feed_comments.member_id
      where feed_comments.post_id = feed_posts.id
        and comment_members.status = 'active'
    ) as comments
  from public.feed_posts
  join public.members on members.id = feed_posts.member_id
  cross join active_session
  where members.status = 'active'
  order by feed_posts.created_at desc
  limit 50;
$$;

grant execute on function public.list_feed_posts(uuid, text)
  to anon, authenticated;

create or replace function public.create_feed_post(
  active_member_id uuid,
  secret_code text,
  post_body text,
  post_image_urls jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_body text := left(trim(coalesce(post_body, '')), 700);
  normalized_images jsonb := coalesce(post_image_urls, '[]'::jsonb);
  created_post_id uuid;
begin
  if not exists (
    select 1
    from public.members
    where members.id = active_member_id
      and members.status = 'active'
      and members.access_code = secret_code
  ) then
    raise exception 'Active member not found.';
  end if;

  if jsonb_typeof(normalized_images) <> 'array' then
    raise exception 'Post images must be an array.';
  end if;

  if jsonb_array_length(normalized_images) > 4 then
    raise exception 'Feed post can have at most 4 images.';
  end if;

  if char_length(normalized_body) < 1
    and jsonb_array_length(normalized_images) < 1 then
    raise exception 'Post must have text or image.';
  end if;

  insert into public.feed_posts (member_id, body, image_urls)
  values (active_member_id, normalized_body, normalized_images)
  returning id into created_post_id;

  return created_post_id;
end;
$$;

grant execute on function public.create_feed_post(uuid, text, text, jsonb)
  to anon, authenticated;

create or replace function public.toggle_feed_like(
  active_member_id uuid,
  secret_code text,
  target_post_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.members
    where members.id = active_member_id
      and members.status = 'active'
      and members.access_code = secret_code
  ) then
    raise exception 'Active member not found.';
  end if;

  if not exists (
    select 1
    from public.feed_posts
    where feed_posts.id = target_post_id
  ) then
    raise exception 'Post not found.';
  end if;

  if exists (
    select 1
    from public.feed_likes
    where feed_likes.post_id = target_post_id
      and feed_likes.member_id = active_member_id
  ) then
    delete from public.feed_likes
    where feed_likes.post_id = target_post_id
      and feed_likes.member_id = active_member_id;

    return false;
  end if;

  insert into public.feed_likes (post_id, member_id)
  values (target_post_id, active_member_id);

  return true;
end;
$$;

grant execute on function public.toggle_feed_like(uuid, text, uuid)
  to anon, authenticated;

create or replace function public.create_feed_comment(
  active_member_id uuid,
  secret_code text,
  target_post_id uuid,
  comment_body text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_body text := left(trim(coalesce(comment_body, '')), 400);
  created_comment_id uuid;
begin
  if char_length(normalized_body) < 1 then
    raise exception 'Comment cannot be empty.';
  end if;

  if not exists (
    select 1
    from public.members
    where members.id = active_member_id
      and members.status = 'active'
      and members.access_code = secret_code
  ) then
    raise exception 'Active member not found.';
  end if;

  if not exists (
    select 1
    from public.feed_posts
    where feed_posts.id = target_post_id
  ) then
    raise exception 'Post not found.';
  end if;

  insert into public.feed_comments (post_id, member_id, body)
  values (target_post_id, active_member_id, normalized_body)
  returning id into created_comment_id;

  return created_comment_id;
end;
$$;

grant execute on function public.create_feed_comment(uuid, text, uuid, text)
  to anon, authenticated;
