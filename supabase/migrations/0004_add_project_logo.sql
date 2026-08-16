-- Migration para adicionar coluna logo na tabela projects
-- Executar no SQL Editor do Supabase

ALTER TABLE projects ADD COLUMN IF NOT EXISTS logo text;
