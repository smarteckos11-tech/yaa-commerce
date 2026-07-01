-- ============================================================
-- YAA Commerce — Supabase Schema
-- Exécutez ce script dans Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ============================================================
-- 1. PROFILES (utilisateurs YAA — étend auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  phone text,
  boutique_name text,
  plan text default 'decouverte' check (plan in ('decouverte', 'business', 'pro')),
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================
-- 2. PRODUCTS (catalogue boutique)
-- ============================================================
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  sku text,
  category text check (category in ('Mode', 'Artisanat', 'Beauté', 'Digital', 'Alimentation', 'Mobilier', 'Musique')),
  type text default 'physique' check (type in ('physique', 'digital')),
  price integer not null check (price >= 0),
  stock integer, -- null = infini (digital)
  sold integer default 0,
  status text default 'actif' check (status in ('actif', 'inactif', 'brouillon')),
  description text,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================
-- 3. CUSTOMERS (clients d'une boutique)
-- ============================================================
create table if not exists public.customers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  email text,
  phone text,
  whatsapp text,
  city text,
  country text,
  total_spent integer default 0,
  orders_count integer default 0,
  loyalty integer default 0, -- 0-100
  segment text default 'nouveau' check (segment in ('vip', 'regulier', 'actif', 'nouveau')),
  last_order_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- ============================================================
-- 4. ORDERS (commandes)
-- ============================================================
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  customer_id uuid references public.customers on delete set null,
  customer_name text not null,
  customer_phone text,
  customer_city text,
  customer_country text,
  items jsonb not null default '[]'::jsonb,
  amount integer not null check (amount >= 0),
  payment_method text check (payment_method in ('Wave', 'Orange Money', 'MTN MoMo', 'Moov', 'Carte bancaire', 'Paiement à la livraison')),
  status text default 'nouveau' check (status in ('nouveau', 'en_preparation', 'expedie', 'livre', 'annule')),
  -- COD (Cash on Delivery)
  cod_enabled boolean default false,
  cod_amount integer,
  cod_status text check (cod_status in ('a_collecter', 'collecte', 'non_collecte', 'reconcilie')),
  cod_collected_at timestamp with time zone,
  cod_collected_by text,
  cod_discrepancy integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================
-- 5. SHIPMENTS (livraisons)
-- ============================================================
create table if not exists public.shipments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  order_id uuid references public.orders on delete cascade,
  customer_name text not null,
  origin_city text not null,
  destination_city text not null,
  carrier text check (carrier in ('Yango', 'DHL', 'Coursier Local', 'FedEx')),
  tracking_code text,
  status text default 'en_preparation' check (status in ('en_transit', 'livre', 'en_preparation', 'retourne')),
  eta timestamp with time zone,
  fee integer not null check (fee >= 0),
  -- COD fields (si paiement à la livraison)
  cod_amount integer,
  cod_status text check (cod_status in ('a_collecter', 'collecte', 'non_collecte', 'reconcilie')),
  created_at timestamp with time zone default now()
);

-- ============================================================
-- 6. TRANSACTIONS (paiements)
-- ============================================================
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  order_id uuid references public.orders on delete set null,
  customer_name text not null,
  provider text check (provider in ('Wave', 'Orange Money', 'MTN MoMo', 'Moov', 'Carte bancaire', 'Paiement à la livraison')),
  amount integer not null check (amount >= 0),
  reference text,
  status text default 'en_attente' check (status in ('reussi', 'en_attente', 'echec')),
  created_at timestamp with time zone default now()
);

-- ============================================================
-- 7. PAYMENT_PROVIDERS (configuration Mobile Money par boutique)
-- ============================================================
create table if not exists public.payment_providers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  provider_name text not null,
  is_connected boolean default false,
  api_key_encrypted text,
  webhook_secret_encrypted text,
  balance integer default 0,
  transactions_count integer default 0,
  created_at timestamp with time zone default now()
);

-- ============================================================
-- 8. WHATSAPP_CONVERSATIONS
-- ============================================================
create table if not exists public.whatsapp_conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  customer_name text not null,
  customer_phone text,
  last_message text,
  unread_count integer default 0,
  is_online boolean default false,
  is_vip boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================
-- 9. WHATSAPP_MESSAGES
-- ============================================================
create table if not exists public.whatsapp_messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.whatsapp_conversations on delete cascade not null,
  sender text check (sender in ('boutique', 'client', 'ia')),
  content text not null,
  is_ia_suggestion boolean default false,
  created_at timestamp with time zone default now()
);

-- ============================================================
-- 10. MARKETING_CAMPAIGNS
-- ============================================================
create table if not exists public.marketing_campaigns (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  channel text check (channel in ('Email', 'SMS', 'WhatsApp', 'Push')),
  status text default 'planifiee' check (status in ('active', 'planifiee', 'terminee')),
  sent_count integer default 0,
  opened_count integer default 0,
  clicked_count integer default 0,
  revenue integer default 0,
  created_at timestamp with time zone default now()
);

-- ============================================================
-- 11. CONTACT_MESSAGES (formulaire de contact public)
-- ============================================================
create table if not exists public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text,
  subject text,
  boutique_name text,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- ============================================================
-- 12. ENABLE ROW LEVEL SECURITY (CRITICAL)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.shipments enable row level security;
alter table public.transactions enable row level security;
alter table public.payment_providers enable row level security;
alter table public.whatsapp_conversations enable row level security;
alter table public.whatsapp_messages enable row level security;
alter table public.marketing_campaigns enable row level security;
alter table public.contact_messages enable row level security;

-- ============================================================
-- 13. RLS POLICIES — chaque user ne voit que SES données
-- ============================================================

-- Profiles : un user ne voit/édite que son propre profil
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Products : CRUD complet mais seulement sur ses propres produits
create policy "Users can view own products" on public.products for select using (auth.uid() = user_id);
create policy "Users can insert own products" on public.products for insert with check (auth.uid() = user_id);
create policy "Users can update own products" on public.products for update using (auth.uid() = user_id);
create policy "Users can delete own products" on public.products for delete using (auth.uid() = user_id);

-- Customers : CRUD complet mais seulement sur ses propres clients
create policy "Users can view own customers" on public.customers for select using (auth.uid() = user_id);
create policy "Users can insert own customers" on public.customers for insert with check (auth.uid() = user_id);
create policy "Users can update own customers" on public.customers for update using (auth.uid() = user_id);
create policy "Users can delete own customers" on public.customers for delete using (auth.uid() = user_id);

-- Orders : CRUD complet mais seulement sur ses propres commandes
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can insert own orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "Users can update own orders" on public.orders for update using (auth.uid() = user_id);
create policy "Users can delete own orders" on public.orders for delete using (auth.uid() = user_id);

-- Shipments
create policy "Users can view own shipments" on public.shipments for select using (auth.uid() = user_id);
create policy "Users can insert own shipments" on public.shipments for insert with check (auth.uid() = user_id);
create policy "Users can update own shipments" on public.shipments for update using (auth.uid() = user_id);
create policy "Users can delete own shipments" on public.shipments for delete using (auth.uid() = user_id);

-- Transactions
create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.transactions for insert with check (auth.uid() = user_id);

-- Payment providers
create policy "Users can view own payment_providers" on public.payment_providers for select using (auth.uid() = user_id);
create policy "Users can insert own payment_providers" on public.payment_providers for insert with check (auth.uid() = user_id);
create policy "Users can update own payment_providers" on public.payment_providers for update using (auth.uid() = user_id);
create policy "Users can delete own payment_providers" on public.payment_providers for delete using (auth.uid() = user_id);

-- WhatsApp
create policy "Users can view own conversations" on public.whatsapp_conversations for select using (auth.uid() = user_id);
create policy "Users can insert own conversations" on public.whatsapp_conversations for insert with check (auth.uid() = user_id);
create policy "Users can update own conversations" on public.whatsapp_conversations for update using (auth.uid() = user_id);

create policy "Users can view own messages" on public.whatsapp_messages for select using (
  exists (
    select 1 from public.whatsapp_conversations c
    where c.id = whatsapp_messages.conversation_id and c.user_id = auth.uid()
  )
);
create policy "Users can insert own messages" on public.whatsapp_messages for insert with check (
  exists (
    select 1 from public.whatsapp_conversations c
    where c.id = whatsapp_messages.conversation_id and c.user_id = auth.uid()
  )
);

-- Marketing campaigns
create policy "Users can view own campaigns" on public.marketing_campaigns for select using (auth.uid() = user_id);
create policy "Users can insert own campaigns" on public.marketing_campaigns for insert with check (auth.uid() = user_id);
create policy "Users can update own campaigns" on public.marketing_campaigns for update using (auth.uid() = user_id);
create policy "Users can delete own campaigns" on public.marketing_campaigns for delete using (auth.uid() = user_id);

-- Contact messages : tout le monde peut insérer (formulaire public),
-- mais seul l'admin peut lire (à configurer plus tard avec un rôle admin)
create policy "Anyone can insert contact messages" on public.contact_messages for insert with check (true);
-- Pour lire les messages, il faut être authentifié ET être l'admin YAA
-- (à adapter selon votre stratégie admin — pour l'instant on autorise les users authentifiés)
create policy "Authenticated users can read contact messages" on public.contact_messages for select using (auth.uid() is not null);

-- ============================================================
-- 14. AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 15. UPDATED_AT triggers
-- ============================================================
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
  for each row execute function public.update_updated_at();

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders
  for each row execute function public.update_updated_at();

-- ============================================================
-- 16. INDEX pour performance
-- ============================================================
create index if not exists idx_products_user_id on public.products(user_id);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_cod_status on public.orders(cod_status) where cod_enabled = true;
create index if not exists idx_customers_user_id on public.customers(user_id);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_shipments_user_id on public.shipments(user_id);
create index if not exists idx_whatsapp_conversations_user_id on public.whatsapp_conversations(user_id);
create index if not exists idx_contact_messages_created_at on public.contact_messages(created_at desc);

-- ============================================================
-- ✅ SCHÉMA CRÉÉ AVEC SUCCÈS
-- ============================================================
-- Vos tables sont prêtes. Row Level Security activé partout.
-- Chaque utilisateur ne peut voir que ses propres données.
-- Les nouveaux inscrits auront automatiquement un profil créé.

-- ============================================================
-- 17. PRODUCT_REVIEWS (avis clients)
-- ============================================================
create table if not exists public.product_reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products on delete cascade not null,
  user_id uuid references public.profiles on delete set null,
  author_name text not null,
  author_email text,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  comment text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  helpful_count integer default 0,
  created_at timestamp with time zone default now()
);

alter table public.product_reviews enable row level security;

-- Anyone can read APPROVED reviews
create policy "Anyone can read approved reviews" on public.product_reviews
  for select using (status = 'approved');

-- Anyone can insert reviews (public form)
create policy "Anyone can insert reviews" on public.product_reviews
  for insert with check (true);

-- Product owners can manage reviews on their products
create policy "Owners can manage reviews" on public.product_reviews
  for all using (
    exists (
      select 1 from public.products p
      where p.id = product_reviews.product_id and p.user_id = auth.uid()
    )
  );

create index if not exists idx_reviews_product_id on public.product_reviews(product_id);
create index if not exists idx_reviews_status on public.product_reviews(status);

-- ============================================================
-- 21. SMS_LOGS (historique des SMS envoyés via Twilio)
-- ============================================================
create table if not exists public.sms_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  phone text not null,
  message text not null,
  status text default 'pending' check (status in ('pending', 'sent', 'delivered', 'failed')),
  twilio_sid text,
  twilio_status text,
  error_message text,
  order_id uuid references public.orders on delete set null,
  customer_id uuid references public.customers on delete set null,
  trigger text,
  created_at timestamp with time zone default now()
);

alter table public.sms_logs enable row level security;

create policy "Users can view own sms logs" on public.sms_logs for select using (auth.uid() = user_id);
create policy "Users can insert own sms logs" on public.sms_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own sms logs" on public.sms_logs for update using (auth.uid() = user_id);
create policy "Users can delete own sms logs" on public.sms_logs for delete using (auth.uid() = user_id);

create index if not exists idx_sms_logs_user_id on public.sms_logs(user_id);
create index if not exists idx_sms_logs_created_at on public.sms_logs(created_at desc);
create index if not exists idx_sms_logs_order_id on public.sms_logs(order_id);

-- ============================================================
-- 22. RETURNS (retours et remboursements)
-- ============================================================
create table if not exists public.returns (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  order_id uuid references public.orders on delete cascade not null,
  customer_name text not null,
  customer_phone text,
  customer_email text,
  reason text check (reason in ('defect', 'wrong_item', 'not_as_described', 'damaged_shipping', 'changed_mind', 'late_delivery', 'other')),
  reason_details text,
  requested_refund_amount integer default 0,
  approved_refund_amount integer,
  refund_method text check (refund_method in ('original', 'wave', 'orange_money', 'mtn_momo', 'moov', 'cash', 'store_credit')),
  refund_reference text,
  status text default 'requested' check (status in ('requested', 'under_review', 'approved', 'rejected', 'refunded', 'received_back')),
  items_count integer default 1,
  admin_notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  resolved_at timestamp with time zone
);

alter table public.returns enable row level security;

create policy "Users can view own returns" on public.returns for select using (auth.uid() = user_id);
create policy "Users can insert own returns" on public.returns for insert with check (auth.uid() = user_id);
create policy "Users can update own returns" on public.returns for update using (auth.uid() = user_id);
create policy "Users can delete own returns" on public.returns for delete using (auth.uid() = user_id);

create index if not exists idx_returns_user_id on public.returns(user_id);
create index if not exists idx_returns_order_id on public.returns(order_id);
create index if not exists idx_returns_status on public.returns(status);
create index if not exists idx_returns_created_at on public.returns(created_at desc);

-- ============================================================
-- 23. MARKETPLACE_EXTENSIONS (extensions installées par boutique)
-- ============================================================
create table if not exists public.marketplace_extensions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  extension_name text not null,
  extension_category text,
  developer text,
  price text,
  status text default 'active' check (status in ('active', 'disabled')),
  config jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

alter table public.marketplace_extensions enable row level security;

do $$ begin
  create policy "Users can view own extensions" on public.marketplace_extensions for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can insert own extensions" on public.marketplace_extensions for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can update own extensions" on public.marketplace_extensions for update using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can delete own extensions" on public.marketplace_extensions for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

create index if not exists idx_marketplace_extensions_user_id on public.marketplace_extensions(user_id);
create index if not exists idx_marketplace_extensions_extension_name on public.marketplace_extensions(extension_name);
