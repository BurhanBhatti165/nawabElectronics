create extension if not exists "pgcrypto";

create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo text,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  show_on_home boolean not null default false,
  home_description text,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  price numeric not null,
  discount_price numeric,
  stock integer not null default 0,
  images text not null default '[]',
  category_id uuid not null references categories(id),
  brand_id uuid not null references brands(id),
  created_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  phone text,
  role text not null default 'customer',
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  city text not null,
  total_amount numeric not null,
  payment_method text not null,
  status text not null default 'pending',
  payment_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity integer not null,
  price numeric not null
);

alter table brands
  drop column if exists slug,
  drop column if exists description;

alter table categories
  drop column if exists slug,
  drop column if exists parent_id,
  drop column if exists featured,
  drop column if exists image;

alter table categories
  add column if not exists show_on_home boolean not null default false,
  add column if not exists home_description text;

alter table products
  drop column if exists slug,
  drop column if exists features,
  drop column if exists specifications,
  drop column if exists is_featured;
