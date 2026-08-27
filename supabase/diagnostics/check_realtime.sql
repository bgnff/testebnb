-- Verificar se o realtime está habilitado nas tabelas
-- Executar no SQL Editor do Supabase para verificar o status

-- Verificar quais tabelas estão na publicação supabase_realtime
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Se as tabelas tasks, columns e calendar_notes não aparecerem no resultado,
-- execute as migrations 0007, 0008 e 0009
