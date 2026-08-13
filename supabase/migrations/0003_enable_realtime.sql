-- Habilitar Realtime na tabela clients
-- Executar no SQL Editor do Supabase

-- Habilitar replicação para a tabela clients
ALTER PUBLICATION supabase_realtime ADD TABLE clients;
