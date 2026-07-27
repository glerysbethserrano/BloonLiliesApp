-- Bloon Lilies — Supabase schema
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query)

create extension if not exists "pgcrypto";

-- Preset decoration products (editable from the Settings page)
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  default_description text default '',
  created_at timestamptz default now()
);

-- Quotes (cotizaciones) and invoices (facturas)
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  doc_number text not null unique,
  type text not null check (type in ('quote', 'invoice')),
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'accepted', 'declined', 'partial', 'paid')),
  locked boolean not null default false,

  client_name text not null,
  client_phone text default '',
  client_email text default '',

  event_date date,
  location text default '',
  theme text default '',

  subtotal numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  deposit numeric(10,2) not null default 0,
  balance numeric(10,2) not null default 0,

  notes text default '',
  quote_pdf_path text,
  invoice_pdf_path text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Line items for each document
create table if not exists line_items (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  product_name text not null,
  description text default '',
  quantity numeric(10,2) not null default 1,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create index if not exists idx_line_items_document on line_items(document_id);
create index if not exists idx_documents_status on documents(status);
create index if not exists idx_documents_type on documents(type);
create index if not exists idx_documents_event_date on documents(event_date);

-- Row Level Security: only the logged-in Bloon Lilies account can read/write.
alter table products enable row level security;
alter table documents enable row level security;
alter table line_items enable row level security;

create policy "Authenticated full access on products"
  on products for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated full access on documents"
  on documents for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated full access on line_items"
  on line_items for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Storage bucket for saved PDFs (create this from the Supabase dashboard too,
-- see README step 3 — this statement is here for reference/automation).
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Authenticated access to documents bucket"
  on storage.objects for all
  using (bucket_id = 'documents' and auth.role() = 'authenticated')
  with check (bucket_id = 'documents' and auth.role() = 'authenticated');

-- A starter set of decoration products — edit freely from the Settings page.
insert into products (name, default_description) values
  ('Arco orgánico', 'Arco de globos orgánico a la entrada'),
  ('Arco cuadrado', 'Arco cuadrado con globos y flecos'),
  ('Centro de mesa', 'Centro de mesa con globos'),
  ('Columna de globos', 'Columna sencilla o doble de globos'),
  ('Garland / Guirnalda', 'Guirnalda de globos orgánica'),
  ('Backdrop', 'Fondo decorado para fotos')
on conflict do nothing;
