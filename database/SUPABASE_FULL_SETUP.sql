-- SOCAILLY SUPABASE FULL SETUP
-- This script contains all the tables, functions, triggers, and policies 
-- required for the Socially application.

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. PROFILES table (Public user data)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  campus text,
  batch text,
  branch text,
  bio text,
  username text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_profiles_username on public.profiles(username);

-- 3. Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, campus, batch, branch)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    'https://ui-avatars.com/api/?name=' || replace(coalesce(new.raw_user_meta_data->>'full_name', 'User'), ' ', '+'),
    new.raw_user_meta_data->>'campus',
    new.raw_user_meta_data->>'batch',
    new.raw_user_meta_data->>'branch'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users
-- Note: Check if the trigger already exists before creating
do $$ 
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  end if;
end $$;

-- 4. POSTS table
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  content text,
  image_urls jsonb default '[]'::jsonb,
  visibility jsonb default '{"batches": [], "campuses": [], "branches": []}'::jsonb,
  category text default 'general',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint max_images_limit check (jsonb_array_length(image_urls) <= 5)
);

-- 5. LIKES table
create table public.likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);

-- 6. COMMENTS table
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  parent_id uuid references public.comments(id) on delete cascade,
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. CONNECTIONS table (Friendships/Follows)
create table public.connections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  friend_id uuid references public.profiles(id) not null,
  status text not null check (status in ('pending', 'accepted')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, friend_id)
);

-- 8. NOTIFICATIONS table
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null, -- Recipient
  sender_id uuid references public.profiles(id) not null, -- Who sent it
  type text not null, -- 'friend_request', 'like', 'comment'
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  data jsonb -- metadata (e.g., connection_id)
);

-- 9. REPORTS table
create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  reporter_id uuid references public.profiles(id) not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  reason text not null,
  status text default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. ENABLE ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.connections enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

-- 11. POLICIES

-- Profiles: Everyone can view, User can update own
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Posts: Everyone can view, Authenticated can create, Owner can delete
create policy "Public posts are viewable by everyone" on public.posts for select using (true);
create policy "Authenticated can create posts" on public.posts for insert with check (auth.role() = 'authenticated');
create policy "Users can delete own posts" on public.posts for delete using (auth.uid() = user_id);

-- Likes: Viewable by everyone, Authenticated can toggle
create policy "Likes are viewable by everyone" on public.likes for select using (true);
create policy "Authenticated can insert likes" on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can delete own likes" on public.likes for delete using (auth.uid() = user_id);

-- Comments: Viewable by everyone, Authenticated can comment
create policy "Comments are viewable by everyone" on public.comments for select using (true);
create policy "Authenticated can insert comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can update own comments" on public.comments for update using (auth.uid() = user_id);
create policy "Users can delete own comments" on public.comments for delete using (auth.uid() = user_id);

-- Connections: Participants can view/action
create policy "Connections viewable by participants" on public.connections for select using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "Users can initiate connections" on public.connections for insert with check (auth.uid() = user_id);
create policy "Users can update received connections" on public.connections for update using (auth.uid() = friend_id);
create policy "Users can delete connections" on public.connections for delete using (auth.uid() = user_id or auth.uid() = friend_id);

-- Notifications: Recipient can view/update/delete
create policy "Users can view their own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "System/Users can create notifications" on public.notifications for insert with check (true);
create policy "Users can update their own notifications" on public.notifications for update using (auth.uid() = user_id);
create policy "Users can delete their own or sent notifications" on public.notifications for delete using (auth.uid() = user_id or auth.uid() = sender_id);

-- Reports: Authenticated users can create, Admins (usually) could view all
create policy "Authenticated users can create reports" on public.reports for insert with check (auth.role() = 'authenticated');
create policy "Users can view their own reports" on public.reports for select using (auth.uid() = reporter_id);

-- 12. STORAGE BUCKETS
insert into storage.buckets (id, name, public) 
values ('posts', 'posts', true), 
       ('avatars', 'avatars', true) 
on conflict (id) do nothing;

-- 13. STORAGE POLICIES

-- Posts bucket policies
do $$ begin
  drop policy if exists "Anyone can view post images" on storage.objects;
  drop policy if exists "Authenticated can upload post images" on storage.objects;
end $$;
create policy "Anyone can view post images" on storage.objects for select using ( bucket_id = 'posts' );
create policy "Authenticated can upload post images" on storage.objects for insert with check ( bucket_id = 'posts' and auth.role() = 'authenticated' );

-- Avatars policies
do $$ begin
  drop policy if exists "Anyone can view avatars" on storage.objects;
  drop policy if exists "Authenticated can upload avatars" on storage.objects;
  drop policy if exists "Users can update own avatar" on storage.objects;
  drop policy if exists "Users can delete own avatar" on storage.objects;
end $$;
create policy "Anyone can view avatars" on storage.objects for select using ( bucket_id = 'avatars' );
create policy "Authenticated can upload avatars" on storage.objects for insert with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );
create policy "Users can update own avatar" on storage.objects for update using ( bucket_id = 'avatars' and auth.uid() = owner );
create policy "Users can delete own avatar" on storage.objects for delete using ( bucket_id = 'avatars' and auth.uid() = owner );
