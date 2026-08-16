-- Migration para atualizar tabela clients existente
-- Executar no SQL Editor do Supabase

-- 1. Remover coluna phone se existir
ALTER TABLE clients DROP COLUMN IF EXISTS phone;

-- 2. Atualizar constraint de plan
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_plan_check;
ALTER TABLE clients ADD CONSTRAINT clients_plan_check 
  CHECK (plan in ('personalizado','essencial','growth','dominancia'));

-- 3. Atualizar constraint de status
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_status_check;
ALTER TABLE clients ADD CONSTRAINT clients_status_check 
  CHECK (status in ('manutencao_recorrente','cliente_ativo','pendente','inativo'));

-- 4. Adicionar coluna monthly_value se não existir
ALTER TABLE clients ADD COLUMN IF NOT EXISTS monthly_value numeric;

-- 5. Adicionar coluna next_payment_date se não existir
ALTER TABLE clients ADD COLUMN IF NOT EXISTS next_payment_date date;

-- 6. Atualizar valores existentes para novos defaults
UPDATE clients SET plan = 'personalizado' WHERE plan NOT IN ('personalizado','essencial','growth','dominancia');
UPDATE clients SET status = 'pendente' WHERE status NOT IN ('manutencao_recorrente','cliente_ativo','pendente','inativo');
