-- NOTIFICATIONS table
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null, -- Recipient
  sender_id uuid references public.profiles(id) not null, -- Who sent it
  type text not null, -- 'friend_request', 'like', 'comment'
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  data jsonb -- metadata (e.g., connection_id)
);

-- ENABLE RLS
alter table public.notifications enable row level security;

-- POLICIES
create policy "Users can view their own notifications"
on public.notifications for select
using (auth.uid() = user_id);

create policy "System/Users can create notifications"
on public.notifications for insert
with check (true); -- Usually triggered by app logic

create policy "Users can update their own notifications"
on public.notifications for update
using (auth.uid() = user_id);

create policy "Users can delete their own or sent notifications"
on public.notifications for delete
using (auth.uid() = user_id or auth.uid() = sender_id);
