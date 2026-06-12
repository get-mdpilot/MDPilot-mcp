# MDPilot — Setup Guide

## Open in VS Code and run these commands in the integrated terminal

### Step 1: Scaffold Next.js (run in your projects folder)

```bash
npx create-next-app@latest mdpilot \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack
```

### Step 2: Enter the project and open in VS Code

```bash
cd mdpilot
code .
```

### Step 3: Install dependencies

```bash
# Core — Anthropic SDK + token counting
npm install @anthropic-ai/sdk js-tiktoken

# Editor — CodeMirror 6 for the markdown editor
npm install @codemirror/state @codemirror/view @codemirror/lang-markdown @codemirror/language

# Markdown preview renderer
npm install react-markdown remark-gfm

# Export — zip file generation
npm install jszip file-saver
npm install -D @types/file-saver

# Input validation
npm install zod
```

### Step 4: Set up environment

```bash
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY
```

### Step 5: Replace scaffolded files with MDPilot starters

Copy these files from this starter kit into your project,
replacing the defaults create-next-app generated:

```
CLAUDE.md          → project root (new file)
AGENTS.md          → project root (new file)
.env.example       → project root (new file)

src/types/index.ts           → create this path
src/lib/anthropic.ts         → create this path
src/lib/tokenizer.ts         → create this path
src/lib/prompts/index.ts     → create this path
src/lib/prompts/readme.ts    → create this path
src/lib/prompts/agents.ts    → create this path
src/lib/prompts/claude.ts    → create this path
src/app/api/generate/route.ts → create this path
```

### Step 6: Add path alias to tsconfig.json

Your tsconfig.json should already have this from create-next-app:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Step 7: Add to .gitignore

```
.env.local
```

### Step 8: Verify it works

```bash
npm run dev
# Visit http://localhost:3000
# Then test the API: curl -X POST http://localhost:3000/api/generate \
#   -H "Content-Type: application/json" \
#   -d '{"fileType":"readme","request":{"projectType":"webapp","audience":"public","aiTools":["claude"],"detectedStack":["Next.js","Tailwind"],"selectedFiles":["readme"]}}'
```

### Step 9 (recommended): Install Claude Code for VS Code

Since you're building a product that generates AI instruction files,
use Claude Code while building it — the ultimate dogfood.

Open VS Code Extensions → search "Claude Code" → Install

Your CLAUDE.md and AGENTS.md will automatically load into Claude Code,
giving it full context on the MDPilot project.

## Folder structure after setup

```
mdpilot/
├── CLAUDE.md                    ← Claude Code reads this every session
├── AGENTS.md                    ← All AI tools read this
├── .env.example
├── .env.local                   ← your API key (gitignored)
├── next.config.ts
├── tailwind.config.ts
├── package.json
├── src/
│   ├── app/
│   │   ├── layout.tsx           ← base layout, fonts, metadata
│   │   ├── page.tsx             ← home: 3-mode selector
│   │   ├── globals.css
│   │   ├── generate/
│   │   │   └── page.tsx         ← the 3-question wizard
│   │   ├── task/
│   │   │   └── page.tsx         ← task mode (v2)
│   │   ├── convert/
│   │   │   └── page.tsx         ← convert mode (v2)
│   │   └── api/
│   │       └── generate/
│   │           └── route.ts     ← Claude API pipe
│   ├── components/
│   │   ├── ui/                  ← Button, Card, Input
│   │   ├── fx/                  ← cockpit instruments (FlipWord, ZuluClock, Altimeter, RadarScope, ApproachLights, Reveal)
│   │   ├── Hero.tsx             ← Night Approach hero
│   │   ├── Nav.tsx              ← navigation
│   │   ├── Stepper.tsx          ← wizard stepper
│   │   └── TokenMeter.tsx       ← before/after meter
│   ├── lib/
│   │   ├── anthropic.ts         ← Anthropic client (server only)
│   │   ├── tokenizer.ts         ← js-tiktoken wrapper
│   │   └── prompts/
│   │       ├── index.ts         ← prompt router
│   │       ├── readme.ts        ← README system prompt
│   │       ├── agents.ts        ← AGENTS system prompt
│   │       └── claude.ts        ← CLAUDE system prompt
│   └── types/
│       └── index.ts             ← GenerationRequest + types
```

## What to build first

Week 1 checklist (from the build plan):
1. ✅ Scaffold done (you just did it)
2. Build the home page with 3 mode cards (Generate / Task / Convert)
3. Wire /api/generate and verify one Claude call works end-to-end
4. Set up the basic layout (nav, footer, page wrapper)
5. Deploy to Vercel (even if it's just the landing page)
