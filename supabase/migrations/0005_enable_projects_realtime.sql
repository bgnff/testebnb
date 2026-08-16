-- Habilitar Realtime na tabela projects
-- Executar no SQL Editor do Supabase

-- Habilitar replicação para a tabela projects
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
