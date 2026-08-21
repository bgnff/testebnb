-- Habilitar Realtime na tabela tasks
-- Executar no SQL Editor do Supabase

-- Habilitar replicação para a tabela tasks
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
