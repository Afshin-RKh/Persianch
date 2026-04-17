-- Run this in your Supabase SQL editor to create the businesses table

create table if not exists businesses (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  name_fa text,
  category text not null default 'other',
  city text not null,
  address text,
  phone text,
  website text,
  email text,
  instagram text,
  description text,
  description_fa text,
  logo_url text,
  image_url text,
  google_maps_url text,
  is_featured boolean default false,
  is_verified boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table businesses enable row level security;

-- Allow public read access
create policy "Public can read businesses"
  on businesses for select
  using (true);

-- Allow inserts (admin panel uses anon key — tighten this later with auth)
create policy "Anyone can insert businesses"
  on businesses for insert
  with check (true);

-- Sample data
insert into businesses (name, name_fa, category, city, address, phone, description, description_fa, is_featured, is_verified)
values
  ('Persian Kitchen Zurich', 'آشپزخانه پارسی زوریخ', 'restaurant', 'Zurich', 'Bahnhofstrasse 10', '+41 44 000 0001', 'Authentic Persian cuisine in the heart of Zurich.', 'غذای اصیل ایرانی در قلب زوریخ', true, true),
  ('Dr. Rezaei Medical', 'دکتر رضایی', 'doctor', 'Geneva', 'Rue de Rive 5', '+41 22 000 0002', 'General practitioner speaking Farsi, French and English.', 'پزشک عمومی با زبان فارسی، فرانسوی و انگلیسی', true, true),
  ('Tehran Cafe Basel', 'کافه تهران بازل', 'cafe', 'Basel', 'Freie Strasse 20', '+41 61 000 0003', 'Cozy Persian cafe with tea and sweets.', 'کافه ایرانی دنج با چای و شیرینی', false, true);
