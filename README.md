<div align="center">

# ARES Archive

**Official frontend and main gateway for the ARES Digital Preservation Project**

*A modern, high-performance database dedicated to archiving and safeguarding digital media history.*

---

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-F38020?style=flat-square&logo=cloudflare&logoColor=white)

</div>

---

## Overview

ARES Archive is the primary interface of the **ARES Digital Preservation Project** — a comprehensive initiative to catalogue, preserve, and make accessible the history of digital media. Built on a Next.js + TypeScript stack and deployed on Cloudflare Pages for global edge delivery.

---

## File Structure

```
ares-archive/
├── .github/
│   └── workflows/          # CI/CD — Supabase secrets injected at build time
├── dist/                   # Production build output
├── functions/
│   └── api/                # Cloudflare Pages serverless functions
├── public/                 # Static assets
├── src/                    # Application source code
│   ├── components/         # Reusable UI components
│   ├── pages/              # Next.js routes
│   └── styles/             # Global styles & Tailwind directives
├── .gitignore
├── README.md
├── eslint.config.js        # Base ESLint config
├── eslint.dualite.config.js
├── index.html              # Root HTML entry point
├── netlify.toml            # Netlify config (fallback)
├── next.config.js
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.dualite.json
├── tsconfig.node.json
└── vite.config.ts          # Basename removed for root domain deploy
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm v9+
- Supabase project
- Cloudflare account

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/ildenteproibito/ares-archive.git
cd ares-archive

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# → Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## Deployment

Deployed automatically via **GitHub Actions → Cloudflare Pages**.

- Push to `main` triggers build and deploy
- Supabase secrets are injected securely at build time (see `.github/workflows/`)
- `vite.config.ts` has no `base` path set — routes correctly from the root domain

---

## Tech Stack

| | Technology |
|---|---|
| Framework | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend / DB | Supabase |
| Build Tool | Vite |
| Hosting | Cloudflare Pages |
| Linting | ESLint + Dualite |

---

## Contributing

Issues and pull requests are welcome.

```bash
git checkout -b feature/your-feature
git commit -m "feat: your feature"
git push origin feature/your-feature
# → Open a Pull Request
```

---

<div align="center">

Maintained by [**ildenteproibito**](https://github.com/ildenteproibito) — IL DENTE PROIBITO

</div>
