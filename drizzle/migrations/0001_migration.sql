ALTER TABLE public.dams ADD COLUMN IF NOT EXISTS panorama_url text;
ALTER TABLE public.dams ADD COLUMN IF NOT EXISTS gallery_urls text[] NOT NULL DEFAULT '{}';