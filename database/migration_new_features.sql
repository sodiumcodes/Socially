-- Migration to add saved_posts, events, and resources tables

-- 1. SAVED_POSTS table
create table if not exists public.saved_posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);

-- 2. EVENTS table
create table if not exists public.events (
  id uuid default uuid_generate_v4() primary key,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  event_date date not null,
  event_time time not null,
  location text not null,
  image_url text,
  category text default 'General',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. RESOURCES table
create table if not exists public.resources (
  id uuid default uuid_generate_v4() primary key,
  uploader_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  category text not null,
  file_url text not null,
  file_type text not null,
  file_size text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable RLS
alter table public.saved_posts enable row level security;
alter table public.events enable row level security;
alter table public.resources enable row level security;

-- 5. Policies for saved_posts
create policy "Users can view their own saved posts" on public.saved_posts for select using (auth.uid() = user_id);
create policy "Users can save posts" on public.saved_posts for insert with check (auth.uid() = user_id);
create policy "Users can unsave posts" on public.saved_posts for delete using (auth.uid() = user_id);

-- 6. Policies for events
create policy "Events are viewable by everyone" on public.events for select using (true);
create policy "Authenticated users can create events" on public.events for insert with check (auth.role() = 'authenticated');
create policy "Creators can update their own events" on public.events for update using (auth.uid() = creator_id);
create policy "Creators can delete their own events" on public.events for delete using (auth.uid() = creator_id);

-- 7. Policies for resources
create policy "Resources are viewable by everyone" on public.resources for select using (true);
create policy "Authenticated users can upload resources" on public.resources for insert with check (auth.role() = 'authenticated');
create policy "Uploaders can update their own resources" on public.resources for update using (auth.uid() = uploader_id);
create policy "Uploaders can delete their own resources" on public.resources for delete using (auth.uid() = uploader_id);

-- 8. Storage bucket for resources
insert into storage.buckets (id, name, public) values ('resources', 'resources', true) on conflict (id) do nothing;
create policy "Anyone can view resources" on storage.objects for select using ( bucket_id = 'resources' );
create policy "Authenticated can upload resources" on storage.objects for insert with check ( bucket_id = 'resources' and auth.role() = 'authenticated' );
