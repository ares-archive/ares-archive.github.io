# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Removed

- **RandomGameWidget component** — Fully removed the `src/components/RandomGameWidget.tsx` file and all associated references:
  - Deleted `src/components/RandomGameWidget.tsx` (178 lines) — the roulette-style random game recommendation widget with Framer Motion animations.
  - Removed the `import RandomGameWidget` statement from `src/pages/Home.tsx`.
  - Removed the `<RandomGameWidget games={games} />` usage and its surrounding JSX comment from the Home page sidebar layout.

### Fixed

- **TypeScript compilation error in `src/pages/Home.tsx`** (line 199) — Removed a dead-code comparison `lang === 'es'` that caused a TypeScript error because the `Language` union type (`'it' | 'en'` in `src/i18n/translations.ts`) does not include `'es'`. The `message_es` field remains on the `Announcement` interface and is still managed via the Admin Dashboard; it will fall through to the English fallback (`ann.message`) until Spanish is formally added to the `Language` union.

---

## [1.0.0] — Previous Release

> For prior changes, see the [git commit history](https://github.com/ares-archive/ares-archive.github.io/commits/main).
