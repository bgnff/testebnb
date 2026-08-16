-- Fase 1 - Schema do banco de dados BnBWeb
-- Copiar e colar no SQL Editor do Supabase em três blocos separados

-- ============================================
-- 1.1 — Tabelas
-- ============================================

-- profiles: substitui a entidade User do Base44
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('admin','user')) default 'user'
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  color text default '#7c3aed',
  icon text default 'LayoutDashboard',
  logo text,
  user_id uuid references auth.users(id) default auth.uid(),
  created_at timestamptz default now()
);

create table boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) default auth.uid(),
  created_at timestamptz default now()
);

create table columns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  board_id uuid references boards(id) on delete cascade not null,
  position numeric default 0,
  wip_limit numeric,
  wip_enabled boolean default false,
  user_id uuid references auth.users(id) default auth.uid()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  column_id uuid references columns(id) on delete cascade not null,
  board_id uuid references boards(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade not null,
  due_date date,
  priority text check (priority in ('low','medium','high','urgent')) default 'medium',
  labels jsonb default '[]',
  assignee text,
  subtasks jsonb default '[]',
  comments jsonb default '[]',
  attachments jsonb default '[]',
  position numeric default 0,
  completed boolean default false,
  user_id uuid references auth.users(id) default auth.uid(),
  created_at timestamptz default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text,
  whatsapp text,
  plan text check (plan in ('personalizado','essencial','growth','dominancia')) default 'personalizado',
  status text check (status in ('manutencao_recorrente','cliente_ativo','pendente','inativo')) default 'pendente',
  notes text,
  meeting_date date,
  meeting_time text,
  meeting_topic text,
  meeting_status text check (meeting_status in ('scheduled','done','cancelled')) default 'scheduled',
  monthly_value numeric,
  next_payment_date date,
  user_id uuid references auth.users(id) default auth.uid(),
  created_at timestamptz default now()
);

create table pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  project_id uuid references projects(id) on delete cascade not null,
  position numeric default 0,
  color text default '#7c3aed',
  user_id uuid references auth.users(id) default auth.uid()
);

create table pipeline_cards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  whatsapp text,
  notes text,
  stage_id uuid references pipeline_stages(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade not null,
  stage_history jsonb default '[]',
  position numeric default 0,
  value numeric,
  user_id uuid references auth.users(id) default auth.uid(),
  created_at timestamptz default now()
);

create table calendar_notes (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  content text not null,
  project_id uuid references projects(id) on delete cascade not null,
  color text default '#7c3aed',
  user_id uuid references auth.users(id) default auth.uid()
);

create table message_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text check (type in ('cobranca','upgrade','reuniao','outro')) default 'outro',
  subject text,
  body text not null,
  user_id uuid references auth.users(id) default auth.uid()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  type text,
  message text not null,
  read boolean default false,
  task_id uuid references tasks(id) on delete cascade,
  user_id uuid references auth.users(id) default auth.uid(),
  created_at timestamptz default now()
);

-- ============================================
-- 1.2 — RLS e policies
-- ============================================

alter table profiles enable row level security;
alter table projects enable row level security;
alter table boards enable row level security;
alter table columns enable row level security;
alter table tasks enable row level security;
alter table clients enable row level security;
alter table pipeline_stages enable row level security;
alter table pipeline_cards enable row level security;
alter table calendar_notes enable row level security;
alter table message_templates enable row level security;
alter table notifications enable row level security;

-- profiles usa "id" no lugar de "user_id" como referência ao usuário
create policy "user_owns_profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "user_owns_row" on projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_owns_row" on boards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_owns_row" on columns
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_owns_row" on tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_owns_row" on clients
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_owns_row" on pipeline_stages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_owns_row" on pipeline_cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_owns_row" on calendar_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_owns_row" on message_templates
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_owns_row" on notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================
-- 1.3 — Trigger de novo usuário
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
