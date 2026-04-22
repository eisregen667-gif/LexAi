// lib/planos.ts
// Definição dos planos e suas permissões

export type Plano = "gratuito" | "basico" | "pro";

export const PLANOS = {
  gratuito: {
    nome: "Gratuito",
    preco: 0,
    analises_mes: 3,
    chat_perguntas: 5,
    minuta: false,
    comparar: false,
    resumo_cliente: false,
    painel: false,
    alertas_email: false,
    exportar_pdf: false,
  },
  basico: {
    nome: "Básico",
    preco: 97,
    analises_mes: 30,
    chat_perguntas: 20,
    minuta: false,
    comparar: false,
    resumo_cliente: false,
    painel: false,
    alertas_email: true,
    exportar_pdf: false,
  },
  pro: {
    nome: "Pro",
    preco: 197,
    analises_mes: Infinity,
    chat_perguntas: Infinity,
    minuta: true,
    comparar: true,
    resumo_cliente: true,
    painel: true,
    alertas_email: true,
    exportar_pdf: true,
  },
} as const;

export function temPermissao(plano: Plano, recurso: keyof typeof PLANOS.pro): boolean {
  return PLANOS[plano][recurso] as boolean;
}

export function limiteAnalises(plano: Plano): number {
  return PLANOS[plano].analises_mes;
}
