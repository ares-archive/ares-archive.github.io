🗃️ ARES Archive — Digital Preservation Frontend
<div align="center">
![TypeScript](https://img.shields.io/badge/TypeScript-90.2%25-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![HTML](https://img.shields.io/badge/HTML-6.0%25-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-2.2%25-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS](https://img.shields.io/badge/CSS-1.6%25-1572B6?style=for-the-badge&logo=css3&logoColor=white)
Official frontend and main gateway for the ARES Digital Preservation Project.  
A modern, high-performance database dedicated to archiving and safeguarding digital media history.
</div>
---
📖 Overview
ARES Archive is the official frontend interface for the ARES Digital Preservation Project — a comprehensive initiative aimed at cataloguing, preserving, and making accessible the history of digital media. Built with a modern TypeScript stack, it serves as the primary gateway for users to interact with the ARES preservation database.
The platform is designed with performance and scalability at its core, leveraging a Next.js architecture deployed on Cloudflare Pages for global edge delivery.
---
✨ Features
🌐 Cloudflare Pages Deployment — Edge-hosted for maximum global performance
⚡ Next.js + TypeScript — Type-safe, SSR/SSG-capable modern React framework
🎨 Tailwind CSS — Utility-first styling for a responsive and consistent UI
🔒 Supabase Integration — Secure backend with secrets managed via GitHub Actions workflows
🛡️ ESLint + Dualite Config — Strict linting rules for code quality
📦 Vite-compatible config — Fast HMR and optimized production builds
🌍 Root domain deploy — Configured for clean deployment at the root domain (no basename)
---
🗂️ Project Structure
```
ares-archive/
│
├── .github/
│   └── workflows/              # CI/CD pipelines — Supabase secrets injected at build time
│
├── dist/                       # Production build output
│
├── functions/
│   └── api/                    # Serverless API functions (Cloudflare Workers / Pages Functions)
│
├── public/                     # Static assets served as-is
│
├── src/                        # Main application source code
│   ├── components/             # Reusable UI components
│   ├── pages/                  # Next.js page routes
│   ├── styles/                 # Global styles and Tailwind directives
│   └── ...                     # Additional source modules
│
├── .gitignore                  # Git ignored files and directories
├── README.md                   # Project documentation (you are here)
│
├── eslint.config.js            # Base ESLint configuration
├── eslint.dualite.config.js    # Extended Dualite linting rules
│
├── index.html                  # Root HTML entry point
├── netlify.toml                # Netlify deployment config (legacy / fallback)
├── next.config.js              # Next.js configuration
│
├── package-lock.json           # Locked dependency tree
├── package.json                # Project metadata and npm scripts
│
├── postcss.config.js           # PostCSS configuration (used by Tailwind)
├── tailwind.config.js          # Tailwind CSS configuration
│
├── tsconfig.app.json           # TypeScript config for the application
├── tsconfig.dualite.json       # TypeScript config for Dualite tooling
├── tsconfig.json               # Root TypeScript configuration
├── tsconfig.node.json          # TypeScript config for Node.js context (e.g. config files)
│
└── vite.config.ts              # Vite configuration — basename removed for root domain deploy
```
---
🚀 Getting Started
Prerequisites
Node.js v18 or higher
npm v9 or higher
A Cloudflare account (for deployment)
A Supabase project (for backend services)
Installation
Clone the repository
```bash
   git clone https://github.com/ildenteproibito/ares-archive.git
   cd ares-archive
   ```
Install dependencies
```bash
   npm install
   ```
Configure environment variables
Create a `.env.local` file at the root of the project and add your Supabase credentials:
```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
Start the development server
```bash
   npm run dev
   ```
The application will be available at `http://localhost:3000`.
---
🏗️ Build & Deploy
Local Production Build
```bash
npm run build
```
The compiled output will be placed in the `dist/` directory.
Deployment
This project is deployed via Cloudflare Pages with automatic CI/CD through GitHub Actions.
Push to `main` triggers an automatic build and deploy.
Supabase secrets are injected securely at build time via GitHub Actions workflow secrets (see `.github/workflows/`).
The `vite.config.ts` is configured without a `base` path to ensure correct routing at the root domain.
---
🔧 Scripts
Command	Description
`npm run dev`	Start the local development server
`npm run build`	Build the project for production
`npm run preview`	Preview the production build locally
`npm run lint`	Run ESLint across the codebase
---
🛠️ Tech Stack
Layer	Technology
Framework	Next.js
Language	TypeScript
Styling	Tailwind CSS
Build Tool	Vite
Backend / DB	Supabase
Hosting	Cloudflare Pages
Linting	ESLint + Dualite config
---
🤝 Contributing
ARES Archive is currently maintained by a single contributor. Contributions, issues, and feature requests are welcome.
Fork the repository
Create your feature branch: `git checkout -b feature/my-feature`
Commit your changes: `git commit -m 'feat: add my feature'`
Push to the branch: `git push origin feature/my-feature`
Open a Pull Request
---
📄 License
This project is private and maintained by IL DENTE PROIBITO. All rights reserved.
---
<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/ildenteproibito">ildenteproibito</a> — ARES Digital Preservation Project</sub>
</div>
