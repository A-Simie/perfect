-- Perfection: Initial Database Schema
-- Run this in the Supabase SQL Editor

-- ============================================================
-- PROFILES — extends auth.users with app-specific data
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  date_of_birth date,
  gender text check (gender in ('female', 'male', 'prefer-not-to-say')),
  onboarding_step smallint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- BEAUTY PROFILES — AI analysis results
-- ============================================================
create table public.beauty_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  skin_tone text,
  undertone text check (undertone in ('warm', 'cool', 'neutral', 'olive')),
  face_shape text check (face_shape in ('oval', 'round', 'square', 'heart', 'oblong', 'diamond')),
  eye_color text,
  hair_type text check (hair_type in ('straight', 'wavy', 'curly', 'coily')),
  hair_color text,
  skin_concerns text[] default '{}',
  analysis_confidence numeric(4,2),
  analyzed_at timestamptz not null default now(),
  constraint one_beauty_profile_per_user unique (user_id)
);

alter table public.beauty_profiles enable row level security;

create policy "Users can read own beauty profile"
  on public.beauty_profiles for select
  using (auth.uid() = user_id);

create policy "Users can upsert own beauty profile"
  on public.beauty_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own beauty profile"
  on public.beauty_profiles for update
  using (auth.uid() = user_id);

-- ============================================================
-- STYLE PREFERENCES — user-defined tastes
-- ============================================================
create table public.style_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  aesthetic_tags text[] default '{}',
  preferred_colors text[] default '{}',
  avoided_colors text[] default '{}',
  fit_preferences jsonb default '{}',
  budget_range jsonb default '{}',
  updated_at timestamptz not null default now(),
  constraint one_style_pref_per_user unique (user_id)
);

alter table public.style_preferences enable row level security;

create policy "Users can read own style preferences"
  on public.style_preferences for select
  using (auth.uid() = user_id);

create policy "Users can upsert own style preferences"
  on public.style_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own style preferences"
  on public.style_preferences for update
  using (auth.uid() = user_id);

-- ============================================================
-- OCCASIONS — event types (system + user-created)
-- ============================================================
create table public.occasions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  formality text not null check (formality in ('casual', 'smart-casual', 'semi-formal', 'formal', 'black-tie')),
  icon text,
  is_system boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.occasions enable row level security;

create policy "Anyone can read system occasions"
  on public.occasions for select
  using (is_system = true);

create policy "Users can read own custom occasions"
  on public.occasions for select
  using (auth.uid() = created_by);

create policy "Users can create custom occasions"
  on public.occasions for insert
  with check (auth.uid() = created_by and is_system = false);

create policy "Users can delete own custom occasions"
  on public.occasions for delete
  using (auth.uid() = created_by and is_system = false);

-- Seed system occasions
insert into public.occasions (name, formality, icon, is_system) values
  ('Wedding', 'formal', 'rings', true),
  ('Date Night', 'smart-casual', 'heart', true),
  ('Job Interview', 'semi-formal', 'briefcase', true),
  ('Casual Day', 'casual', 'sun', true),
  ('Evening Out', 'smart-casual', 'wine', true),
  ('Black Tie Event', 'black-tie', 'gem', true),
  ('Brunch', 'casual', 'coffee', true),
  ('Graduation', 'semi-formal', 'graduation-cap', true),
  ('Birthday Party', 'smart-casual', 'cake', true),
  ('Business Meeting', 'semi-formal', 'building-2', true);

-- ============================================================
-- LOOKS — AI-generated style recommendations
-- ============================================================
create table public.looks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  occasion_id uuid references public.occasions(id) on delete set null,
  title text not null,
  description text,
  image_url text,
  style_notes jsonb default '{}',
  is_saved boolean not null default false,
  rating smallint check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

alter table public.looks enable row level security;

create policy "Users can read own looks"
  on public.looks for select
  using (auth.uid() = user_id);

create policy "Users can create own looks"
  on public.looks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own looks"
  on public.looks for update
  using (auth.uid() = user_id);

create policy "Users can delete own looks"
  on public.looks for delete
  using (auth.uid() = user_id);

-- ============================================================
-- LOOK ITEMS — individual pieces within a look
-- ============================================================
create table public.look_items (
  id uuid primary key default gen_random_uuid(),
  look_id uuid not null references public.looks(id) on delete cascade,
  category text not null check (category in ('hair', 'makeup', 'outfit', 'accessory', 'fragrance', 'nail')),
  name text not null,
  description text,
  color text,
  brand text,
  product_url text,
  sort_order smallint not null default 0
);

alter table public.look_items enable row level security;

create policy "Users can read items of own looks"
  on public.look_items for select
  using (
    exists (
      select 1 from public.looks
      where looks.id = look_items.look_id
        and looks.user_id = auth.uid()
    )
  );

create policy "Users can create items for own looks"
  on public.look_items for insert
  with check (
    exists (
      select 1 from public.looks
      where looks.id = look_items.look_id
        and looks.user_id = auth.uid()
    )
  );

create policy "Users can update items of own looks"
  on public.look_items for update
  using (
    exists (
      select 1 from public.looks
      where looks.id = look_items.look_id
        and looks.user_id = auth.uid()
    )
  );

create policy "Users can delete items of own looks"
  on public.look_items for delete
  using (
    exists (
      select 1 from public.looks
      where looks.id = look_items.look_id
        and looks.user_id = auth.uid()
    )
  );

-- ============================================================
-- USER PHOTOS — uploaded selfies and reference images
-- ============================================================
create table public.user_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  purpose text not null check (purpose in ('selfie', 'reference', 'occasion')),
  uploaded_at timestamptz not null default now()
);

alter table public.user_photos enable row level security;

create policy "Users can read own photos"
  on public.user_photos for select
  using (auth.uid() = user_id);

create policy "Users can upload own photos"
  on public.user_photos for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own photos"
  on public.user_photos for delete
  using (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_beauty_profiles_user on public.beauty_profiles(user_id);
create index idx_style_preferences_user on public.style_preferences(user_id);
create index idx_looks_user on public.looks(user_id);
create index idx_looks_occasion on public.looks(occasion_id);
create index idx_look_items_look on public.look_items(look_id);
create index idx_user_photos_user on public.user_photos(user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_style_preferences_updated_at
  before update on public.style_preferences
  for each row execute function public.set_updated_at();
