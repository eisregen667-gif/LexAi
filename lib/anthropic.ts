// lib/anthropic.ts
// Funções de integração com a Claude API para análise de processos jurídicos

import Anthropic from "@anthropic-ai/sdk";
import type { AnaliseProcesso } from "./types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ─── Prompt de sistema para análise jurídica ─────────────────────────────────

const SYSTEM_PROMPT_ANALISE = `Você é um assistente especializado em análise de processos jurídicos brasileiros.
Sua tarefa é extrair informações estruturadas de petições, despachos, sentenças e demais documentos processuais.

Ao analisar um processo, você DEVE retornar APENAS um objeto JSON válido (sem markdown, sem texto antes ou depois)
seguindo exatamente esta estrutura:

{
  "numero_processo": "string ou null",
  "vara": "string ou null",
  "comarca": "string ou null",
  "tribunal": "string ou null",
  "tipo_acao": "string — ex: Ação de Cobrança, Ação de Indenização, etc.",
  "assunto": "string — tema geral resumido",
  "valor_causa": "string ou null — ex: R$ 50.000,00",
  "data_distribuicao": "YYYY-MM-DD ou null",
  "partes": [
    {
      "nome": "string",
      "tipo": "autor|réu|terceiro|advogado|juiz|promotor|outro",
      "cpf_cnpj": "string ou null",
      "advogado": "string ou null — se a parte tiver advogado identificado"
    }
  ],
  "objeto": "string — parágrafo claro descrevendo do que se trata o processo",
  "pedidos": [
    {
      "descricao": "string — descrição do pedido",
      "tipo": "principal|tutela|liminar|outro"
    }
  ],
  "decisoes": [
    {
      "data": "YYYY-MM-DD",
      "tipo": "string — despacho|sentença|acórdão|liminar|decisão interlocutória|etc.",
      "descricao": "string — resumo da decisão",
      "resultado": "string ou null — deferido|indeferido|parcialmente deferido|etc."
    }
  ],
  "prazos": [
    {
      "descricao": "string — o que deve ser feito ou o que acontece nessa data",
      "data_limite": "YYYY-MM-DD",
      "responsavel": "string ou null — quem deve cumprir",
      "criticidade": "alta|media|baixa",
      "cumprido": false
    }
  ],
  "timeline": [
    {
      "data": "YYYY-MM-DD",
      "tipo": "string — petição|despacho|decisão|juntada|audiência|etc.",
      "descricao": "string — descrição breve do evento",
      "autor": "string ou null"
    }
  ],
  "resumo_executivo": "string — parágrafo de 3-5 frases resumindo o processo de forma clara",
  "observacoes": "string ou null — pontos de atenção, riscos ou alertas identificados"
}

Regras importantes:
- Datas SEMPRE em formato ISO (YYYY-MM-DD)
- Se uma informação não estiver disponível, use null
- Prazos próximos ou já vencidos = criticidade "alta"
- Ordene a timeline cronologicamente (mais antigo primeiro)
- O resumo executivo deve ser compreensível para um leigo
- Identifique TODOS os prazos mencionados, inclusive implícitos
- Retorne SOMENTE o JSON, sem explicações`;

const SYSTEM_PROMPT_CHAT = `Você é um assistente jurídico especializado, auxiliando advogados brasileiros a compreender processos.
Você tem acesso ao conteúdo completo do processo em análise.

Responda em português, de forma precisa e objetiva. 
- Cite trechos relevantes quando necessário
- Informe datas e prazos com clareza
- Se não souber ou a informação não estiver no processo, diga explicitamente
- Mantenha linguagem profissional mas acessível
- Destaque informações críticas (prazos vencendo, decisões desfavoráveis, etc.)`;

// ─── Analisar processo via PDF em base64 ────────────────────────────────────

export async function analisarProcesso(
  pdfBase64: string
): Promise<AnaliseProcesso> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: SYSTEM_PROMPT_ANALISE,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: pdfBase64,
            },
          },
          {
            type: "text",
            text: "Analise este processo jurídico brasileiro e retorne o JSON estruturado conforme as instruções.",
          },
        ],
      },
    ],
  });

  // Extrair o texto da resposta
  const textoResposta = response.content
    .filter((block) => block.type === "text")
    .map((block) => (block as { type: "text"; text: string }).text)
    .join("");

  // Limpar possíveis marcadores markdown antes de parsear
  const jsonLimpo = textoResposta
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    const analise = JSON.parse(jsonLimpo) as AnaliseProcesso;
    return analise;
  } catch {
    throw new Error(
      `Falha ao processar resposta da IA. Resposta recebida: ${textoResposta.substring(0, 200)}...`
    );
  }
}

// ─── Chat com processo — mantém histórico e PDF no contexto ─────────────────

export async function chatComProcesso(
  analiseJson: AnaliseProcesso,
  pergunta: string,
  historico: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  // Injetar o contexto do processo na primeira mensagem do sistema
  const contextoProcesso = `
=== CONTEXTO DO PROCESSO ===
${JSON.stringify(analiseJson, null, 2)}
=== FIM DO CONTEXTO ===

Responda à pergunta do advogado com base nas informações acima.
  `.trim();

  const mensagens: Anthropic.MessageParam[] = [
    // Histórico anterior
    ...historico.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    // Nova pergunta com contexto
    {
      role: "user",
      content: `${contextoProcesso}\n\nPergunta: ${pergunta}`,
    },
  ];

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT_CHAT,
    messages: mensagens,
  });

  return response.content
    .filter((block) => block.type === "text")
    .map((block) => (block as { type: "text"; text: string }).text)
    .join("");
}
