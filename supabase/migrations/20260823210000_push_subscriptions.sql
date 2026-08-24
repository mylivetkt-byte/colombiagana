-- Suscripciones push de los administradores
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid references public.raffle_config(id) on delete cascade,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_created_idx on public.push_subscriptions (created_at);

alter table public.push_subscriptions enable row level security;

-- Solo los administradores autenticados gestionan sus suscripciones
create policy "admins manage push"
  on public.push_subscriptions
  for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
