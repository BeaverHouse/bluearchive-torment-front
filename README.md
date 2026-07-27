# BA Torment Web

Next.js frontend for BA Torment.

## Features

- Total Assault and Grand Assault party search, summaries, and statistics
- Student usage, synergy, and build recommendations
- Arona’s Archive: chat, boss guides, season reports, and build notes
- YouTube and Bilibili clear-video browsing and analysis
- Raid and Joint Firing Drill score calculators

## Local development

The complete local stack and dependency order are documented in the workspace
`RUNBOOK.md`. The frontend uses pnpm and runs on port `3001`:

```bash
pnpm install
pnpm dev -p 3001
```

Port `3000` is intentionally left available for manual work.

## Backend dependencies

- Static raid and student data: configured public CDN
- Video analysis: `ba-analyzer` on port `8085`
- Arona chat: `llm-client` on port `8080`
- Wiki tools: `data-aggregator` MCP on port `8102`
- LLM gateway: Bifrost on port `4101`

## Verification

Use the repository harness:

```bash
austincli agent check
```

## Deployment

Pull requests receive a Netlify preview. Production deploys after the approved
change is merged.
