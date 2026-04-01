-- Marketplace schema + RLS policies
-- This migration intentionally only adds new tables/policies.

create extension if not exists pgcrypto;

-- =========================
-- Tables
-- =========================

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  role text check (role in ('parent', 'therapist', 'admin')),
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.therapist_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  bio text,
  credentials text,
  specialties text[],
  years_experience int,
  hourly_rate numeric,
  session_types text check (session_types in ('in-person', 'virtual', 'both')),
  languages text[],
  availability_json jsonb,
  stripe_account_id text,
  is_verified boolean default false,
  rating_avg numeric default 0,
  review_count int default 0,
  location_city text,
  location_state text,
  profile_complete boolean default false
);

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.users(id) on delete cascade,
  name text not null,
  date_of_birth date,
  diagnosis_notes text,
  therapy_goals text[]
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.users(id),
  therapist_id uuid references public.users(id),
  child_id uuid references public.children(id),
  session_type text,
  session_date timestamptz,
  duration_minutes int,
  status text check (status in ('pending','confirmed','completed','cancelled')) default 'pending',
  notes text,
  price_cents int,
  stripe_payment_intent_id text
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id),
  parent_id uuid references public.users(id),
  therapist_id uuid references public.users(id),
  rating int check (rating between 1 and 5),
  body text,
  created_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.users(id),
  recipient_id uuid references public.users(id),
  booking_id uuid references public.bookings(id),
  content text,
  read_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.session_notes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id),
  therapist_id uuid references public.users(id),
  child_id uuid references public.children(id),
  goals_addressed text[],
  progress_notes text,
  ai_summary text,
  created_at timestamptz default now()
);

-- =========================
-- RLS
-- =========================

alter table public.users enable row level security;
alter table public.therapist_profiles enable row level security;
alter table public.children enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.messages enable row level security;
alter table public.session_notes enable row level security;

-- =========================
-- Policies
-- =========================

-- users: users can read and update only their own row
drop policy if exists "users_read_own" on public.users;
create policy "users_read_own"
on public.users
for select
to authenticated
using (id = auth.uid());

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
on public.users
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- therapist_profiles: anyone can read (public browse), only owner can update
drop policy if exists "therapist_profiles_public_read" on public.therapist_profiles;
create policy "therapist_profiles_public_read"
on public.therapist_profiles
for select
to anon, authenticated
using (true);

drop policy if exists "therapist_profiles_update_own" on public.therapist_profiles;
create policy "therapist_profiles_update_own"
on public.therapist_profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- children: parent can only read/write their own children
drop policy if exists "children_read_own" on public.children;
create policy "children_read_own"
on public.children
for select
to authenticated
using (parent_id = auth.uid());

drop policy if exists "children_insert_own" on public.children;
create policy "children_insert_own"
on public.children
for insert
to authenticated
with check (parent_id = auth.uid());

drop policy if exists "children_update_own" on public.children;
create policy "children_update_own"
on public.children
for update
to authenticated
using (parent_id = auth.uid())
with check (parent_id = auth.uid());

drop policy if exists "children_delete_own" on public.children;
create policy "children_delete_own"
on public.children
for delete
to authenticated
using (parent_id = auth.uid());

-- bookings: parent can read their own bookings, therapist can read bookings where therapist_id = auth.uid()
drop policy if exists "bookings_read_parent_or_therapist" on public.bookings;
create policy "bookings_read_parent_or_therapist"
on public.bookings
for select
to authenticated
using (parent_id = auth.uid() or therapist_id = auth.uid());

-- reviews: public read, parent can insert their own
drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read"
on public.reviews
for select
to anon, authenticated
using (true);

drop policy if exists "reviews_parent_insert_own" on public.reviews;
create policy "reviews_parent_insert_own"
on public.reviews
for insert
to authenticated
with check (
  parent_id = auth.uid()
  and exists (
    select 1
    from public.bookings b
    where b.id = booking_id
      and b.parent_id = auth.uid()
  )
);

-- messages: sender and recipient can both read, only sender can insert
drop policy if exists "messages_read_sender_or_recipient" on public.messages;
create policy "messages_read_sender_or_recipient"
on public.messages
for select
to authenticated
using (sender_id = auth.uid() or recipient_id = auth.uid());

drop policy if exists "messages_insert_sender_only" on public.messages;
create policy "messages_insert_sender_only"
on public.messages
for insert
to authenticated
with check (sender_id = auth.uid());

-- session_notes: therapist can insert/update their own, parent can read notes for their children
drop policy if exists "session_notes_parent_read_for_child" on public.session_notes;
create policy "session_notes_parent_read_for_child"
on public.session_notes
for select
to authenticated
using (
  exists (
    select 1
    from public.children c
    where c.id = child_id
      and c.parent_id = auth.uid()
  )
);

drop policy if exists "session_notes_therapist_insert_own" on public.session_notes;
create policy "session_notes_therapist_insert_own"
on public.session_notes
for insert
to authenticated
with check (therapist_id = auth.uid());

drop policy if exists "session_notes_therapist_update_own" on public.session_notes;
create policy "session_notes_therapist_update_own"
on public.session_notes
for update
to authenticated
using (therapist_id = auth.uid())
with check (therapist_id = auth.uid());

