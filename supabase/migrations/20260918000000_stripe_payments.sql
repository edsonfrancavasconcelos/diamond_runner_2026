-- Tabelas para pagamentos Stripe via create-checkout / stripe-webhook.
-- Todos os CREATE usam IF NOT EXISTS: seguro rodar mesmo se parte já existir.

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  preco numeric(10,2) not null,
  descricao text,
  stripe_price_id text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plano_id uuid references public.plans(id),
  stripe_session_id text,
  stripe_payment_id text,
  status text not null default 'pending',
  valor numeric(10,2),
  data timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plano_id uuid references public.plans(id),
  stripe_customer_id text,
  status text not null default 'pending',
  data_inicio timestamptz,
  data_fim timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, plano_id)
);

create index if not exists payments_user_id_idx on public.payments(user_id);
create index if not exists payments_stripe_session_id_idx on public.payments(stripe_session_id);
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);

alter table public.plans enable row level security;
alter table public.payments enable row level security;
alter table public.subscriptions enable row level security;

-- Planos ativos são públicos (necessário para exibir a vitrine de preços antes do login).
drop policy if exists "plans_select_active" on public.plans;
create policy "plans_select_active" on public.plans
  for select using (ativo = true);

-- Usuário só enxerga os próprios pagamentos/assinaturas.
-- Não há policy de insert/update/delete para authenticated: só o service_role (Edge Functions) grava.
drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments
  for select using (auth.uid() = user_id);

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);
