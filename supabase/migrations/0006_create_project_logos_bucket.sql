-- Criar bucket para logos de projetos
-- Executar no SQL Editor do Supabase

-- Criar bucket project-logos
insert into storage.buckets (id, name, public)
values ('project-logos', 'project-logos', true)
on conflict (id) do nothing;

-- Habilitar acesso público para leitura
create policy "Public Access Project Logos"
on storage.objects for select
using (bucket_id = 'project-logos');

-- Habilitar upload para usuários autenticados
create policy "Authenticated Upload Project Logos"
on storage.objects for insert
with check (
  bucket_id = 'project-logos' 
  and auth.role() = 'authenticated'
);

-- Habilitar update para usuários autenticados
create policy "Authenticated Update Project Logos"
on storage.objects for update
with check (
  bucket_id = 'project-logos' 
  and auth.role() = 'authenticated'
);
