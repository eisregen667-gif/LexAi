-- supabase/migrations/001_initial_schema.sql
-- Schema inicial do LexIA
-- Execute no Supabase SQL Editor ou via supabase db push

-- ─────────────────────────────────────────────────────────────────────────────
-- Extensões necessárias
-- ─────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- Tabela: processos
-- Armazena cada processo jurídico analisado pelo usuário
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS processos (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_arquivo   TEXT NOT NULL,
  storage_path   TEXT NOT NULL,           -- Caminho no Supabase Storage
  analise        JSONB,                   -- AnaliseProcesso serializado
  status         TEXT NOT NULL DEFAULT 'pendente'
                   CHECK (status IN ('pendente', 'analisando', 'concluido', 'erro')),
  erro_mensagem  TEXT,
  total_paginas  INTEGER,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_processos_user_id    ON processos(user_id);
CREATE INDEX IF NOT EXISTS idx_processos_status     ON processos(status);
CREATE INDEX IF NOT EXISTS idx_processos_created_at ON processos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_processos_analise_gin ON processos USING gin(analise);

-- ─────────────────────────────────────────────────────────────────────────────
-- Tabela: mensagens_chat
-- Histórico de conversas com cada processo
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mensagens_chat (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  processo_id  UUID NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  role         TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content      TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mensagens_processo_id ON mensagens_chat(processo_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_created_at  ON mensagens_chat(created_at ASC);

-- ─────────────────────────────────────────────────────────────────────────────
-- Trigger: atualizar updated_at automaticamente
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_processos_updated_at
  BEFORE UPDATE ON processos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security (RLS)
-- Garante que usuários só acessem seus próprios dados
-- ─────────────────────────────────────────────────────────────────────────────

-- Habilitar RLS
ALTER TABLE processos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens_chat ENABLE ROW LEVEL SECURITY;

-- Policies para processos
CREATE POLICY "Usuários veem apenas seus processos"
  ON processos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários criam apenas seus processos"
  ON processos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários atualizam apenas seus processos"
  ON processos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários deletam apenas seus processos"
  ON processos FOR DELETE
  USING (auth.uid() = user_id);

-- Policies para mensagens_chat (herda permissão do processo)
CREATE POLICY "Usuários veem mensagens dos seus processos"
  ON mensagens_chat FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM processos
      WHERE processos.id = mensagens_chat.processo_id
        AND processos.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários inserem mensagens nos seus processos"
  ON mensagens_chat FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM processos
      WHERE processos.id = mensagens_chat.processo_id
        AND processos.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage: bucket para PDFs com acesso privado
-- Execute separadamente ou via Dashboard do Supabase
-- ─────────────────────────────────────────────────────────────────────────────

-- Criar bucket privado (via API ou Dashboard)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('processos-pdf', 'processos-pdf', false);

-- Policy de storage: usuário acessa apenas sua pasta
-- CREATE POLICY "Usuários acessam sua pasta"
--   ON storage.objects FOR ALL
--   USING (auth.uid()::text = (storage.foldername(name))[1]);

-- ─────────────────────────────────────────────────────────────────────────────
-- Dados de exemplo para desenvolvimento (opcional)
-- ─────────────────────────────────────────────────────────────────────────────
-- Descomente para testar sem fazer upload real:
/*
INSERT INTO processos (user_id, nome_arquivo, storage_path, status, analise)
VALUES (
  auth.uid(),
  'processo-exemplo.pdf',
  'dev/exemplo.pdf',
  'concluido',
  '{
    "numero_processo": "1234567-89.2023.8.26.0001",
    "vara": "1ª Vara Cível",
    "comarca": "São Paulo",
    "tipo_acao": "Ação de Cobrança",
    "objeto": "Cobrança de valores decorrentes de contrato de prestação de serviços.",
    "valor_causa": "R$ 45.000,00",
    "data_distribuicao": "2023-03-15",
    "resumo_executivo": "Ação de cobrança movida por ABC Ltda contra XYZ S.A., referente a serviços prestados e não pagos.",
    "partes": [
      {"nome": "ABC Ltda", "tipo": "autor"},
      {"nome": "XYZ S.A.", "tipo": "réu"}
    ],
    "pedidos": [
      {"descricao": "Condenação ao pagamento de R$ 45.000,00", "tipo": "principal"}
    ],
    "decisoes": [
      {"data": "2023-04-01", "tipo": "despacho", "descricao": "Cite-se o réu."}
    ],
    "prazos": [
      {"descricao": "Contestação do réu", "data_limite": "2024-12-31", "criticidade": "alta", "cumprido": false}
    ],
    "timeline": [
      {"data": "2023-03-15", "tipo": "petição", "descricao": "Distribuição da ação"},
      {"data": "2023-04-01", "tipo": "despacho", "descricao": "Despacho inicial — cite-se"}
    ]
  }'
);
*/
