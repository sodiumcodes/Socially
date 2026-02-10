-- Add new columns to profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS batch text,
ADD COLUMN IF NOT EXISTS campus text,
ADD COLUMN IF NOT EXISTS branch text;

-- Update the handle_new_user function to include the new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, batch, campus, branch)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    'https://ui-avatars.com/api/?name=' || replace(coalesce(new.raw_user_meta_data->>'full_name', 'User'), ' ', '+'),
    new.raw_user_meta_data->>'batch',
    new.raw_user_meta_data->>'campus',
    new.raw_user_meta_data->>'branch'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
