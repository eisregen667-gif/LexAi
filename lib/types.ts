// lib/types.ts
// Tipos centrais do LexIA — compartilhados entre frontend e backend

// ─── Processo jurídico analisado ────────────────────────────────────────────

export interface Parte {
  nome: string;
  tipo: "autor" | "réu" | "terceiro" | "advogado" | "juiz" | "promotor" | "outro";
  cpf_cnpj?: string;
  advogado?: string;
}

export interface Pedido {
  descricao: string;
  tipo?: "principal" | "tutela" | "liminar" | "outro";
}

export interface Decisao {
  data: string;       // ISO date string
  tipo: string;       // "despacho", "sentença", "acórdão", "liminar", etc.
  descricao: string;
  resultado?: string; // "deferido", "indeferido", "parcialmente deferido", etc.
}

export interface Prazo {
  descricao: string;
  data_limite: string; // ISO date string
  responsavel?: string;
  criticidade: "alta" | "media" | "baixa";
  cumprido?: boolean;
}

export interface EventoTimeline {
  data: string;       // ISO date string
  tipo: string;
  descricao: string;
  autor?: string;
}

export interface AnaliseProcesso {
  numero_processo?: string;
  vara?: string;
  comarca?: string;
  tribunal?: string;
  tipo_acao?: string;
  assunto?: string;
  valor_causa?: string;
  data_distribuicao?: string;

  partes: Parte[];
  objeto: string;         // Resumo do que se trata o processo
  pedidos: Pedido[];
  decisoes: Decisao[];
  prazos: Prazo[];
  timeline: EventoTimeline[];

  resumo_executivo: string; // Parágrafo de resumo geral
  observacoes?: string;     // Pontos de atenção identificados pela IA
}

// ─── Supabase — tabelas do banco ────────────────────────────────────────────

export interface ProcessoDB {
  id: string;
  user_id: string;
  nome_arquivo: string;
  storage_path: string;     // Caminho no Supabase Storage
  analise: AnaliseProcesso; // JSON armazenado como jsonb
  status: "pendente" | "analisando" | "concluido" | "erro";
  erro_mensagem?: string;
  total_paginas?: number;
  created_at: string;
  updated_at: string;
}

export interface MensagemChat {
  id: string;
  processo_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// ─── API — request/response shapes ──────────────────────────────────────────

export interface AnalisarResponse {
  sucesso: boolean;
  processo_id?: string;
  analise?: AnaliseProcesso;
  erro?: string;
}

export interface ChatRequest {
  processo_id: string;
  mensagem: string;
  historico: { role: "user" | "assistant"; content: string }[];
}

export interface ChatResponse {
  resposta: string;
  erro?: string;
}

// ─── Helpers de UI ───────────────────────────────────────────────────────────

export type StatusAnalise = ProcessoDB["status"];

export const STATUS_LABELS: Record<StatusAnalise, string> = {
  pendente:    "Na fila",
  analisando:  "Analisando...",
  concluido:   "Concluído",
  erro:        "Erro",
};

export const CRITICIDADE_COR: Record<Prazo["criticidade"], string> = {
  alta:   "text-danger border-danger/40 bg-danger/10",
  media:  "text-warning border-warning/40 bg-warning/10",
  baixa:  "text-gold-400 border-gold-500/40 bg-gold-500/10",
};
