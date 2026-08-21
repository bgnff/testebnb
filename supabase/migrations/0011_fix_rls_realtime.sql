-- Fix RLS para permitir realtime
-- Executar no SQL Editor do Supabase se a sincronização ainda não funcionar

-- O RLS pode bloquear notificações realtime. Verifique se as policies permitem.

-- Para tasks:
-- A policy atual é "user_owns_row" que verifica auth.uid() = user_id
-- Isso deve funcionar para realtime se o usuário tiver acesso aos dados.

-- Se ainda não funcionar, tente desabilitar RLS temporariamente para teste:
-- ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE columns DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE calendar_notes DISABLE ROW LEVEL SECURITY;

-- Depois teste a sincronização. Se funcionar, o problema é no RLS.
-- Se funcionar, reabilite o RLS e ajuste as policies.
