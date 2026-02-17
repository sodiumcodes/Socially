-- CONNECTIONS table (Friendships/Follows)
create table if not exists public.connections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  friend_id uuid references public.profiles(id) not null,
  status text not null check (status in ('pending', 'accepted')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, friend_id)
);

-- ENABLE ROW LEVEL SECURITY
alter table public.connections enable row level security;

-- POLICIES
create policy "Connections viewable by participants" 
on public.connections for select 
using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "Users can initiate connections" 
on public.connections for insert 
with check (auth.uid() = user_id);

create policy "Users can update received connections" 
on public.connections for update 
using (auth.uid() = friend_id);

create policy "Users can delete connections" 
on public.connections for delete 
using (auth.uid() = user_id or auth.uid() = friend_id);
