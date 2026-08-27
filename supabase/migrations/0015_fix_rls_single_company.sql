-- Fix RLS para modelo de empresa única compartilhada (BnBWeb)
-- Esta migration altera as policies para permitir que todos os usuários autenticados
-- acessem e editem todos os dados, seguindo o modelo de "empresa única"

-- Dropar as policies antigas que filtravam por user_id
drop policy if exists "user_owns_row" on boards;
drop policy if exists "user_owns_row" on columns;
drop policy if exists "user_owns_row" on tasks;
drop policy if exists "user_owns_row" on clients;
drop policy if exists "user_owns_row" on calendar_notes;
drop policy if exists "user_owns_row" on message_templates;
drop policy if exists "user_owns_row" on notifications;

-- Criar novas policies que permitem acesso a todos os usuários autenticados
-- Isso permite sincronização em tempo real entre todos os usuários da empresa

-- Boards: qualquer usuário autenticado pode ler/criar/editar/deletar
create policy "authenticated_users_full_access" on boards
  for all using (auth.role() = 'authenticated') 
  with check (auth.role() = 'authenticated');

-- Columns: qualquer usuário autenticado pode ler/criar/editar/deletar
create policy "authenticated_users_full_access" on columns
  for all using (auth.role() = 'authenticated') 
  with check (auth.role() = 'authenticated');

-- Tasks: qualquer usuário autenticado pode ler/criar/editar/deletar
create policy "authenticated_users_full_access" on tasks
  for all using (auth.role() = 'authenticated') 
  with check (auth.role() = 'authenticated');

-- Clients: qualquer usuário autenticado pode ler/criar/editar/deletar
create policy "authenticated_users_full_access" on clients
  for all using (auth.role() = 'authenticated') 
  with check (auth.role() = 'authenticated');

-- Calendar notes: qualquer usuário autenticado pode ler/criar/editar/deletar
create policy "authenticated_users_full_access" on calendar_notes
  for all using (auth.role() = 'authenticated') 
  with check (auth.role() = 'authenticated');

-- Message templates: qualquer usuário autenticado pode ler/criar/editar/deletar
create policy "authenticated_users_full_access" on message_templates
  for all using (auth.role() = 'authenticated') 
  with check (auth.role() = 'authenticated');

-- Notifications: qualquer usuário autenticado pode ler/criar/editar/deletar
create policy "authenticated_users_full_access" on notifications
  for all using (auth.role() = 'authenticated') 
  with check (auth.role() = 'authenticated');
