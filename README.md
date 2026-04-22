<<<<<<< HEAD
# ⚖️ LexIA — Análise Inteligente de Processos Jurídicos

> MicroSaaS para advogados autônomos e pequenos escritórios brasileiros.  
> Faça upload do PDF de um processo e obtenha resumo estruturado, linha do tempo, controle de prazos e chat com IA em ~30 segundos.

---

## Stack

| Camada       | Tecnologia                                         |
|--------------|----------------------------------------------------|
| Frontend     | Next.js 14 (App Router) + Tailwind CSS             |
| IA           | Claude API — `claude-sonnet-4-6`                   |
| PDF parsing  | Envio direto via API da Anthropic (base64)         |
| Banco        | Supabase (Postgres + Auth + Storage)               |
| Pagamentos   | Stripe (próxima fase)                              |
| Deploy       | Vercel                                             |

---

## Pré-requisitos

- Node.js 18+
- Conta na [Anthropic](https://console.anthropic.com) com API Key
- Projeto no [Supabase](https://supabase.com)

---

## Setup em 5 passos

### 1. Clonar e instalar dependências

```bash
git clone <repo>
cd lexia
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas chaves:

```env
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. Configurar Supabase

**3.1 — Criar banco de dados**

No [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor → cole e execute o conteúdo de:

```
supabase/migrations/001_initial_schema.sql
```

**3.2 — Criar bucket de storage**

No Dashboard → Storage → New Bucket:
- Nome: `processos-pdf`
- Public: **desativado** (privado)

Depois, em Storage → Policies, adicione a policy:

```sql
CREATE POLICY "Usuários acessam sua pasta"
  ON storage.objects FOR ALL
  USING (auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
```

**3.3 — Configurar Auth (opcional)**

No Dashboard → Authentication → Settings:
- Desative "Confirm email" durante desenvolvimento
- Configure URL do site para `http://localhost:3000`

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

### 5. Deploy na Vercel

```bash
npm i -g vercel
vercel
```

Configure as variáveis de ambiente no painel da Vercel.

> ⚠️ **Importante**: para processos grandes (PDFs longos), o tempo de análise pode ultrapassar 10s.  
> Configure `maxDuration = 60` no `vercel.json` (requer plano Pro):
>
> ```json
> { "functions": { "app/api/analisar/route.ts": { "maxDuration": 120 } } }
> ```

---

## Estrutura do projeto

```
lexia/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Página de login
│   │   └── cadastro/page.tsx       # Página de cadastro
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Sidebar + proteção de rota
│   │   ├── processos/page.tsx      # Histórico de processos
│   │   └── processo/
│   │       ├── novo/page.tsx       # Upload de PDF
│   │       └── [id]/page.tsx       # Resultado da análise
│   ├── api/
│   │   ├── analisar/route.ts       # POST — envia PDF para Claude
│   │   └── chat/route.ts           # POST — chat com o processo
│   ├── layout.tsx                  # Root layout (fontes, metadata)
│   ├── page.tsx                    # Landing page
│   └── globals.css                 # Design tokens e estilos base
├── components/
│   └── processo/
│       ├── ProcessoView.tsx        # Container com abas
│       ├── ResumoTab.tsx           # Aba de resumo estruturado
│       ├── TimelineTab.tsx         # Linha do tempo
│       ├── PrazosTab.tsx           # Controle de prazos
│       └── ChatPanel.tsx           # Chat lateral
├── lib/
│   ├── anthropic.ts                # Claude API — análise e chat
│   ├── supabase/
│   │   ├── client.ts               # Cliente browser
│   │   └── server.ts               # Cliente servidor
│   ├── types.ts                    # Tipos TypeScript centrais
│   └── utils.ts                    # Helpers (datas, formatação)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Schema completo do banco
├── middleware.ts                   # Proteção de rotas autenticadas
└── .env.local.example              # Variáveis de ambiente necessárias
```

---

## Fluxo de análise

```
Browser          Supabase Storage    Supabase DB         Claude API
  │                    │                  │                   │
  │── upload PDF ──────▶                  │                   │
  │◀── storage_path ───│                  │                   │
  │                    │── INSERT row ────▶                   │
  │                    │   status=analyzing                   │
  │                    │                  │── PDF base64 ────▶│
  │                    │                  │◀── JSON análise ──│
  │                    │                  │── UPDATE analise ─▶
  │                    │                  │   status=concluido│
  │◀─────────── redirect /processo/:id ──────────────────────│
```

---

## Custos estimados (por análise)

| Processo       | Tokens aprox. | Custo (USD) | Custo (BRL ~5.7) |
|----------------|---------------|-------------|-------------------|
| 10 páginas     | ~15k          | ~$0.05      | ~R$ 0,28          |
| 50 páginas     | ~60k          | ~$0.27      | ~R$ 1,55          |
| 100 páginas    | ~120k         | ~$0.54      | ~R$ 3,10          |

*Preços aproximados com `claude-sonnet-4-6` (maio/2025)*

---

## Roadmap (próximas fases)

- [ ] **Stripe** — cobrança dos planos Básico (R$97) e Pro (R$197)
- [ ] **Alertas de prazo** — e-mail via Resend quando prazo se aproximar
- [ ] **OCR** — processos escaneados via Tesseract ou AWS Textract  
- [ ] **Integração PJe** — scraping autenticado para buscar processos
- [ ] **Resumo para cliente** — versão simplificada sem jargão jurídico
- [ ] **Multi-processo** — comparar dois processos relacionados

---

## Licença

Proprietária. Todos os direitos reservados.
=======
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1mtyv4JOzD4oilv1uHPNMcXtpmmnAYIj-

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
>>>>>>> b2e2e5281262a31c16174ed5f0041b46cfde4752
