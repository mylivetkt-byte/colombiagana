-- Chat entre compradores y el administrador de la rifa
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid references public.raffle_config(id) on delete cascade,
  buyer_name text not null,
  buyer_email text not null,
  sender text not null check (sender in ('buyer', 'admin')),
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_email_idx on public.chat_messages (buyer_email);
create index if not exists chat_messages_created_idx on public.chat_messages (created_at);

alter table public.chat_messages enable row level security;

-- Los compradores (anon) pueden iniciar y leer su conversación
create policy "anon can insert chat"
  on public.chat_messages
  for insert
  to anon
  with check (true);

create policy "anon can read chat"
  on public.chat_messages
  for select
  to anon
  using (true);

-- Los administradores autenticados gestionan todos los mensajes
create policy "admins manage chat"
  on public.chat_messages
  for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
