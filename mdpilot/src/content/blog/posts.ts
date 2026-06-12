export type BlogBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'code'; lang?: string; code: string }
  | { type: 'list'; items: string[] }
  | { type: 'callout'; text: string };

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: string;
  tags: string[];
  author: string;
  hero: string;
  blocks: BlogBlock[];
}

export const posts: BlogPost[] = [
  {
    slug: 'stop-pasting-raw-tickets',
    title: 'Stop pasting raw tickets into your AI agent',
    description:
      'The first message decides the whole conversation. Task mode turns a messy Jira ticket or Slack thread into a structured TASK.md your agent can actually fly with.',
    date: '2026-06-12',
    readingTime: '6 min read',
    tags: ['Task mode', 'TASK.md', 'AI agents'],
    author: 'MDPilot team',
    hero: '/blog/task-flight-plan.webp',
    blocks: [
      {
        type: 'p',
        text: 'Every AI coding session has a moment of maximum leverage, and it is not the moment you accept the diff. It is the first message. Whatever the agent reads first becomes its mental model of the task — the scope, the constraints, the definition of done. Get that wrong and every following message is a correction.',
      },
      {
        type: 'p',
        text: 'And yet the most common first message in the industry is a raw paste: a Jira ticket written for a human who already has context, a Slack thread where the actual requirement is buried in message 14 of 32, a bug report that says "doesn\'t work on mobile" and nothing else.',
      },
      { type: 'h2', text: 'Why raw tickets fail as prompts' },
      {
        type: 'p',
        text: 'Tickets are written to coordinate humans, not to instruct agents. They assume shared context ("like we discussed in standup"), they mix decisions with discussion, and they almost never state acceptance criteria explicitly. An agent reading one has to guess at all three — and agents are confident guessers.',
      },
      {
        type: 'list',
        items: [
          '**Missing scope** — the agent doesn\'t know what *not* to touch, so it refactors things you never asked about.',
          '**Implicit done** — without acceptance criteria, the agent decides for itself when it\'s finished. Usually too early.',
          '**Buried constraints** — "must stay backwards compatible" in a thread reply is invisible; in a structured file it\'s a hard gate.',
          '**No verification plan** — the agent writes code but doesn\'t know which command proves it works.',
        ],
      },
      {
        type: 'image',
        src: '/blog/task-flight-plan.webp',
        alt: 'A messy raw ticket transformed through a flight plan into a structured TASK.md with objective, scope, acceptance criteria and agent prompt',
        caption: 'Task mode: raw input on the left, agent-ready flight plan on the right.',
      },
      { type: 'h2', text: 'What Task mode does instead' },
      {
        type: 'p',
        text: 'Task mode on MDPilot takes anything — ticket, thread, voice-note transcript, half a spec — and restructures it into a TASK.md: objective, scope and non-scope, acceptance criteria as checkable items, watch-outs, and an agent prompt block at the bottom designed to be the literal first message you paste into Claude Code, Cursor, or Copilot.',
      },
      {
        type: 'p',
        text: 'The generation runs a gap check while it writes: if your input never mentions how to verify the change, the output flags it instead of inventing one. If scope is ambiguous, the file says so explicitly — an honest "unclear, confirm before starting" beats a confident hallucination.',
      },
      { type: 'h2', text: 'Three execution modes' },
      {
        type: 'list',
        items: [
          '**Developer guide** — written for a human engineer: context first, reasoning explained, tradeoffs visible.',
          '**AI Exec** — written for an agent: imperative, plan-first, with verification gates between steps.',
          '**Context drop** — a compact context file for when the agent already has the task and just needs the background.',
        ],
      },
      {
        type: 'p',
        text: 'AI Exec mode bakes in a plan-first directive: the generated prompt opens by instructing the agent to write a 3–5 line plan and check it against the watch-outs before touching any file. That single instruction eliminates a whole class of "the agent sprinted off in the wrong direction" failures.',
      },
      { type: 'h2', text: 'The workflow' },
      {
        type: 'code',
        lang: 'text',
        code: '1. Paste your ticket/thread at mdpilot.in/task  (≥ 20 chars, no account)\n2. Pick the execution mode\n3. Generate — 5 to 15 seconds\n4. Copy the Agent Prompt block\n5. Paste it as the FIRST message in your AI tool',
      },
      {
        type: 'callout',
        text: 'The quality of how you start an AI conversation determines the quality of the whole conversation. Spend 15 seconds on the flight plan; save 30 minutes of corrections.',
      },
    ],
  },
  {
    slug: 'tokens-are-not-words',
    title: 'Tokens ≠ words: what your context files actually cost',
    description:
      'LLMs don\'t read words — they read tokens, and the exchange rate is weirder than you think. Real numbers from cl100k, and how MDPilot\'s 5-pass optimizer exploits them.',
    date: '2026-06-11',
    readingTime: '7 min read',
    tags: ['tokens', 'optimizer', 'context engineering'],
    author: 'MDPilot team',
    hero: '/blog/tokens-not-words.webp',
    blocks: [
      {
        type: 'p',
        text: 'Ask a developer how long their CLAUDE.md is and they\'ll answer in lines or words. Ask the model and it answers in tokens — and tokens are the only count that matters, because every context window, every rate limit, and every API invoice is denominated in them.',
      },
      { type: 'h2', text: 'What a token actually is' },
      {
        type: 'p',
        text: 'Modern LLMs use byte-pair encoding: the vocabulary is built from the most frequent character sequences in the training data, not from dictionary words. Common words get one token; rarer words get sliced wherever the statistics say. In the cl100k encoding, "the" is 1 token, but "optimization" is 2 — split as `optim` + `ization`.',
      },
      {
        type: 'image',
        src: '/blog/tokens-not-words.webp',
        alt: 'The word optimization split into its two real cl100k tokens, optim and ization, with their token IDs',
        caption: 'Real cl100k split — one word, two tokens, IDs 19680 and 2065.',
      },
      {
        type: 'p',
        text: 'The exchange rate is counterintuitive in both directions. "internationalization" — 20 characters — is also just 2 tokens (`international` + `ization`), because both pieces are common in the training data. Meanwhile a single 🚀 emoji costs 3 tokens. Length in characters tells you almost nothing.',
      },
      {
        type: 'callout',
        text: 'Working rule of thumb for English prose: 1 token ≈ 4 characters ≈ ¾ of a word. But formatting breaks the rule — and that\'s where the savings hide.',
      },
      { type: 'h2', text: 'Formatting is where tokens go to die' },
      {
        type: 'p',
        text: 'Here is the same two-row roster as a markdown table versus a plain list, counted with cl100k:',
      },
      {
        type: 'code',
        lang: 'text',
        code: '| Name | Role |          - Ada — Engineer\n|------|------|          - Lin — Designer\n| Ada | Engineer |\n| Lin | Designer |\n\n   20 tokens                 9 tokens',
      },
      {
        type: 'p',
        text: 'Every pipe, every dash in the separator row, every alignment space is a token. The table costs 2.2× the list and carries identical information. Multiply that across a CLAUDE.md with six tables and you\'ve spent hundreds of tokens on decoration the model doesn\'t need.',
      },
      {
        type: 'p',
        text: 'It\'s worth saying clearly: tables aren\'t bad. When data is genuinely two-dimensional, a table is the right call. The waste is in tables used for things that are really lists, boilerplate phrases repeated in every section, and filler prose ("It is important to note that...") that adds tokens but no instruction.',
      },
      { type: 'h2', text: 'The 5-pass optimizer' },
      {
        type: 'p',
        text: 'Every file MDPilot generates — and any markdown you paste into the optimizer — runs through five passes, each measured against a js-tiktoken baseline so you see exactly what was saved:',
      },
      {
        type: 'list',
        items: [
          '**Tokenize + baseline** — count before touching anything.',
          '**Boilerplate strip** — filler phrases and empty-calorie sentences removed by rule.',
          '**Cross-file dedup** — the same setup instructions in README.md and AGENTS.md? One canonical copy, referenced from the other.',
          '**Verbose compression** — long-winded constructions rewritten tighter without changing meaning.',
          '**Line compression** — structural whitespace and redundant separators collapsed.',
        ],
      },
      {
        type: 'p',
        text: 'Typical result is a 20–40% reduction. On a 4,000-token context file that\'s up to 1,600 tokens back — context that now holds more of your actual code instead of formatting overhead.',
      },
      {
        type: 'p',
        text: 'The counting happens in your browser with js-tiktoken — your markdown never leaves the page just to get measured. Try it on your own CLAUDE.md: the before/after number is usually convincing on its own.',
      },
    ],
  },
  {
    slug: 'markdown-is-what-ai-reads',
    title: 'Markdown is the language AI actually reads',
    description:
      'PDFs, DOCX, slide decks — your knowledge lives in formats built for printing, not for context windows. Why markdown wins, with real token numbers, and how Convert mode uses Microsoft\'s MarkItDown.',
    date: '2026-06-10',
    readingTime: '5 min read',
    tags: ['Convert mode', 'MarkItDown', 'markdown'],
    author: 'MDPilot team',
    hero: '/blog/everything-to-markdown.webp',
    blocks: [
      {
        type: 'p',
        text: 'Your team\'s knowledge is locked in formats designed for paper: PDFs of specs, DOCX requirement docs, slide decks, exported HTML. All of it is readable by humans and hostile to context windows. Before an agent can use any of it, someone — or something — has to translate.',
      },
      { type: 'h2', text: 'The token tax on markup' },
      {
        type: 'p',
        text: 'Here\'s a tiny, honest benchmark. The same content as website HTML and as markdown, counted with cl100k:',
      },
      {
        type: 'code',
        lang: 'text',
        code: '<div class="card"><h2 class="title">Setup</h2>\n<p class="body">Run npm install first.</p></div>\n                                      → 30 tokens\n\n## Setup\n\nRun npm install first.\n                                      → 8 tokens',
      },
      {
        type: 'p',
        text: 'Same information, 3.75× the cost. Every tag, attribute, and class name is tokenized noise the model has to wade through. PDF extraction is even worse — column layouts interleave, headers and footers repeat on every page, and tables arrive as character soup.',
      },
      {
        type: 'p',
        text: 'Markdown sits at the other extreme: its structure markers (#, -, ```) are single cheap tokens, and models have read billions of markdown documents during training — README files, GitHub issues, documentation sites. It is, in a real sense, the native written language of LLMs. That\'s why agent instruction files are .md files and not .docx.',
      },
      {
        type: 'image',
        src: '/blog/everything-to-markdown.webp',
        alt: 'PDF, DOCX, CSV, HTML and PPTX files converging into a single clean markdown document via MarkItDown',
        caption: 'Convert mode: five formats in, one clean .md out.',
      },
      { type: 'h2', text: 'MarkItDown under the hood' },
      {
        type: 'p',
        text: 'MDPilot\'s Convert mode is built on MarkItDown, Microsoft\'s open-source conversion engine. It handles PDF, DOCX, PPTX, XLSX/CSV, and HTML, and it\'s opinionated in the right way: it preserves document *structure* — headings stay headings, lists stay lists, tables become markdown tables — rather than trying to preserve visual layout.',
      },
      {
        type: 'p',
        text: 'That distinction matters for AI use. A pixel-faithful conversion is worthless to a model; a structure-faithful one means the heading hierarchy survives into the context window, and the model can navigate the document the way it navigates any markdown file.',
      },
      { type: 'h2', text: 'Honest caveats' },
      {
        type: 'list',
        items: [
          'Scanned PDFs are images — they need OCR before any converter can help.',
          'Heavily designed layouts (magazine-style multi-column) can scramble reading order.',
          'Complex merged-cell tables sometimes need a manual pass after conversion.',
        ],
      },
      {
        type: 'p',
        text: 'That\'s why Convert mode shows you a live preview pane instead of handing you a file blind — you see exactly what the model will see, and you can fix the 5% before it costs you a confused generation.',
      },
      {
        type: 'callout',
        text: 'Drop a file at mdpilot.in/convert — no account needed. What comes out is what your agent reads.',
      },
    ],
  },
  {
    slug: 'inside-the-hangar',
    title: 'Inside the Hangar: what MDPilot Labs is testing',
    description:
      'Labs is where features earn their place on the flight deck. A tour of the current experiments — Image → Prompt, Interview Primer, Explain — and how the learning loop decides what graduates.',
    date: '2026-06-09',
    readingTime: '5 min read',
    tags: ['Labs', 'experiments', 'roadmap'],
    author: 'MDPilot team',
    hero: '/blog/inside-the-hangar.webp',
    blocks: [
      {
        type: 'p',
        text: 'Every product accumulates features; good products have a place where features prove themselves first. Ours is the Hangar — mdpilot.in/labs — where experiments ship early, get measured honestly, and either graduate to the main deck or get retired without ceremony.',
      },
      {
        type: 'image',
        src: '/blog/inside-the-hangar.webp',
        alt: 'A radar scope scanning, with experiment tiles for Image to Prompt, Interview Primer, Explain, and doc drift radar',
        caption: 'The Hangar board: live experiments on the radar.',
      },
      { type: 'h2', text: 'Image → Prompt' },
      {
        type: 'p',
        text: 'Paste any image and get a recreation prompt engineered for your target generator — FLUX, Stable Diffusion, Midjourney, DALL-E, or Gemini. Each target gets different output, because each model wants prompts in a different dialect: Midjourney rewards comma-packed style stacks, FLUX prefers full sentences, SD wants weighted keywords.',
      },
      {
        type: 'p',
        text: 'The interesting engineering problem isn\'t describing the image — vision models do that well. It\'s describing it in the *idiom of the target model*, which is a translation problem layered on a perception problem.',
      },
      { type: 'h2', text: 'Interview Primer' },
      {
        type: 'p',
        text: 'Role plus level plus job description in; a ready-to-paste AI coach prompt out. Paste it into any chat model and it becomes a focused interviewer for that exact role — asking calibrated questions, pushing on weak answers, staying in character. It\'s the Task mode idea pointed at a different problem: the value is in the structured first message.',
      },
      { type: 'h2', text: 'Explain — WALKTHROUGH.md' },
      {
        type: 'p',
        text: 'Point it at a file or directory and get a guided walkthrough tuned to a chosen audience — new team member, non-technical stakeholder, code reviewer, or future-you. Same code, four very different documents. Currently in testing: directory-level walkthroughs that trace data flow across files rather than explaining each file in isolation.',
      },
      { type: 'h2', text: 'The MCP side of the Hangar' },
      {
        type: 'p',
        text: 'Some experiments live in the mdpilot-mcp server rather than the website, because they need your real repo on disk. The drift radar (check_drift) compares your docs against actual repo state — broken commands, paths that no longer exist, MCP servers that were removed — and update_docs patches only the stale sections. Session memory (save_context / load_context) persists decisions across conversations, locally, with secrets redacted.',
      },
      { type: 'h2', text: 'How experiments graduate' },
      {
        type: 'p',
        text: 'The learning loop decides. Anonymous usage events show which tools get reached for twice; thumbs-up ratings with kept-unedited outputs feed a nightly job that promotes the best generations into gold examples — few-shot anchors that make the next generation better. An experiment that accumulates gold examples is earning its place. One that doesn\'t is telling us something too.',
      },
      {
        type: 'callout',
        text: 'Want to push an experiment toward graduation — or tell us one deserves retirement? The Hangar runs on feedback: github.com/get-mdpilot/Feedback.',
      },
    ],
  },
];
