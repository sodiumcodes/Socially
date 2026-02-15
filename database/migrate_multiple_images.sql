-- Migration: Add support for multiple images per post
-- This script migrates the posts table from single image_url to multiple image_urls

-- Step 1: Add new image_urls column as JSONB array
ALTER TABLE public.posts 
ADD COLUMN image_urls JSONB DEFAULT '[]'::jsonb;

-- Step 2: Migrate existing image_url data to image_urls array
-- Convert single image URLs to single-element arrays
UPDATE public.posts
SET image_urls = jsonb_build_array(image_url)
WHERE image_url IS NOT NULL AND image_url != '';

-- Step 3: Set empty array for posts with no images
UPDATE public.posts
SET image_urls = '[]'::jsonb
WHERE image_url IS NULL OR image_url = '';

-- Step 4: Drop the old image_url column
ALTER TABLE public.posts 
DROP COLUMN image_url;

-- Step 5: Add constraint to limit maximum 5 images per post
ALTER TABLE public.posts
ADD CONSTRAINT max_images_limit 
CHECK (jsonb_array_length(image_urls) <= 5);

-- Step 6: Add comment for documentation
COMMENT ON COLUMN public.posts.image_urls IS 'Array of image URLs (max 5 images per post)';
