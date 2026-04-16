# Stack Trace Decoder

A developer tool that decodes browser console errors and stack traces into plain-English explanations with a root cause and exact fix — powered by the Claude AI API with streaming responses.

---

## Features

- **Two-panel layout** — paste your error on the left, see the structured explanation stream in on the right
- **5-part structured output** — What happened, Where it happened, Root cause, How to fix it, How to prevent this
- **Error type auto-detection** — classifies React, TypeScript, Next.js, CORS, and CSS errors before the API call to improve output quality
- **Streaming responses** — output appears progressively as Claude generates it, with a blinking cursor per section
- **Shareable links** — encode both the trace and the decoded result into a URL; recipients see the full result instantly with no API call
- **Common errors gallery** — 12 pre-decoded errors across React, TypeScript, Next.js, and CORS categories; click any card to load it into the decoder
- **Prompt caching** — the Claude system prompt is cached on the Anthropic side, reducing latency and cost on repeat requests

---

## Tech Stack

| Layer      | Technology                                                |
| ---------- | --------------------------------------------------------- |
| Framework  | Next.js 15 (App Router)                                   |
| Language   | TypeScript (strict mode)                                  |
| Styling    | Tailwind CSS v4                                           |
| Icons      | Lucide React                                              |
| AI         | Anthropic Claude API (`claude-sonnet-4-6`) with streaming |
| Fonts      | Fira Code (monospace), Inter (UI) via `next/font/google`  |
| Deployment | Netlify + `@netlify/plugin-nextjs`                        |

---

## Architecture

```
stack-trace-decoder/
├── app/
│   ├── globals.css          # Tailwind v4 CSS-first config + design tokens
│   ├── layout.tsx           # Root layout, fonts, metadata (Server Component)
│   ├── page.tsx             # Main page, reads share URL params (Server Component)
│   └── api/decode/route.ts  # Streaming POST route — calls Claude API (Server)
├── components/
│   ├── DecoderShell.tsx     # State container, fetch orchestration (Client)
│   ├── TraceInput.tsx       # Textarea, error type badge, submit (Client)
│   ├── ResultPanel.tsx      # Renders streaming sections + share button (Client)
│   ├── StreamingSection.tsx # Individual section with markdown-lite renderer (Client)
│   ├── ShareButton.tsx      # Clipboard copy with visual feedback (Client)
│   ├── GallerySection.tsx   # Common errors grid — zero client JS (Server)
│   └── GalleryCard.tsx      # Gallery link card (Server)
├── lib/
│   ├── claude.ts            # Anthropic client, system prompt, stream generator
│   ├── detect-error-type.ts # Regex-based error classifier (pure function)
│   ├── share.ts             # Base64url encode/decode for share URLs
│   └── common-errors.ts     # 12 hand-authored pre-decoded error entries
└── types/
    └── index.ts             # Shared TypeScript interfaces
```

**Server vs. Client boundary:** The gallery, page shell, and share URL decoding are Server Components — they render to static HTML with zero client JavaScript. Only the interactive decoder panel (`DecoderShell` and its children) ships client JS.

---

## Getting Started

### Prerequisites

- Node.js 20+
- An [Anthropic API key](https://console.anthropic.com/)

### Installation

```bash
git clone https://github.com/tomd0627/stack-trace-decoder.git
cd stack-trace-decoder
npm install
```

### Environment setup

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Type checking + linting

```bash
npm run type-check   # tsc --noEmit
npm run lint         # ESLint
```

---

## How It Works

### Error detection

Before the API call, `lib/detect-error-type.ts` runs a series of regex rules against the pasted trace to classify it as React, TypeScript, Next.js, CORS, CSS, or generic. This classification is injected into the user prompt to improve output quality.

### Prompt caching

The system prompt is ~1400 tokens and never changes between requests. It's passed to Claude with `cache_control: { type: "ephemeral" }`, which keeps it cached server-side for ~5 minutes. Repeat requests within that window skip re-processing the prompt, reducing both latency and cost.

### Streaming

The API route returns a `ReadableStream` of plain text. The client reads it chunk by chunk and calls a buffer parser on each chunk. The parser finds `## SECTION_NAME` headers using a regex and builds the section array progressively — earlier sections are marked complete as soon as the next header arrives.

### Share links

Share URLs encode the raw trace and the decoded result as base64url in query params (`?t=...&r=...`). The Next.js page reads these as a Server Component and passes the pre-decoded result to `DecoderShell`. If a share URL contains both params, no API call is made — the result renders from the URL.

---

## Deployment

### Netlify

1. Connect the repository to Netlify
2. Build settings are in `netlify.toml` — no manual configuration needed
3. Add `ANTHROPIC_API_KEY` under **Site settings → Environment variables**
4. Deploy

### Other platforms (Vercel, Railway, etc.)

Standard Next.js 15 deployment. Set `ANTHROPIC_API_KEY` as a server-side environment variable (not `NEXT_PUBLIC_`).

---

## Design

Dark terminal theme — the only dark-mode project in the portfolio, appropriate for a debugging tool.

| Token             | Value     | Usage                         |
| ----------------- | --------- | ----------------------------- |
| `--color-base`    | `#0f1117` | Page background               |
| `--color-surface` | `#161b27` | Panel backgrounds             |
| `--color-accent`  | `#6366f1` | Indigo — interactive elements |
| `--color-warning` | `#f59e0b` | Amber — root cause sections   |
| `--color-success` | `#10b981` | Green — fix sections          |
| `--color-error`   | `#ef4444` | Red — error states            |

All text/background combinations meet WCAG AA contrast (4.5:1 minimum).

---

## License

MIT
