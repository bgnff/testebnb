-- Habilitar Realtime na tabela calendar_notes
-- Executar no SQL Editor do Supabase

-- Habilitar replicação para a tabela calendar_notes
ALTER PUBLICATION supabase_realtime ADD TABLE calendar_notes;
