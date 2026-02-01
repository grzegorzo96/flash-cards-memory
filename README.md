# FlashCardsMemory with AI

[![status](https://img.shields.io/badge/status-MVP%20in%20progress-blue)](#project-status)
[![node](https://img.shields.io/badge/node-22.17.1-339933)](#getting-started-locally)
[![license](https://img.shields.io/badge/license-not%20specified-lightgrey)](#license)

## Table of contents
- [Project name](#project-name)
- [Project description](#project-description)
- [Tech stack](#tech-stack)
- [Getting started locally](#getting-started-locally)
- [Available scripts](#available-scripts)
- [Project scope](#project-scope)
- [Project status](#project-status)
- [License](#license)

## Project name
FlashCardsMemory with AI

## Project description
FlashCardsMemory is a web application for creating and learning with educational flashcards. It uses AI to generate high-quality flashcards from source text and applies the FSRS (Free Spaced Repetition Scheduler) algorithm to optimize review scheduling. The workflow focuses on fast input, preview and editing, and efficient spaced repetition study sessions.

## Tech stack
**Frontend**
- Astro 5
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui

**Backend**
- Supabase (PostgreSQL database, Auth, SDK)

**AI**
- OpenRouter.ai for model access (target model: GPT-5.2, per PRD)

**Analytics**
- PostHog

**CI/CD & hosting**
- GitHub Actions
- DigitalOcean (Docker-based hosting)

**Tooling**
- ESLint
- Prettier

**Testing**
- Vitest (unit tests)
- React Testing Library
- MSW (Mock Service Worker)
- Playwright (E2E tests)

## Getting started locally
**Prerequisites**
- Node.js `22.17.1` 
- npm (recommended with the Node.js install)

**Install dependencies**
```bash
npm install
```

**Run the app in development**
```bash
npm run dev
```

Astro will start the dev server (default: `http://localhost:4321`).

## Available scripts
From `package.json`:

**Development**
- `npm run dev` - start Astro dev server
- `npm run build` - build for production
- `npm run preview` - preview production build
- `npm run astro` - run Astro CLI commands

**Code quality**
- `npm run lint` - run ESLint to check for linting issues
- `npm run format` - format files with Prettier
- `npm run format:check` - check formatting with Prettier

**Testing**
- `npm run test` - run unit tests in watch mode
- `npm run test:run` - run unit tests once
- `npm run test:ui` - run unit tests with interactive UI
- `npm run test:coverage` - run unit tests with coverage report
- `npm run test:e2e` - run end-to-end tests with Playwright
- `npm run test:e2e:ui` - run E2E tests with interactive UI
- `npm run test:e2e:debug` - run E2E tests in debug mode
- `npm run test:e2e:codegen` - generate E2E tests using Playwright codegen

For more details, see [TESTING.md](./TESTING.md)

## Project scope
**In MVP**
- AI flashcard generation from pasted text (up to 5000 characters)
- Domain selection to improve AI output quality
- Preview, edit, delete, and manually add flashcards before saving
- Manual flashcard creation and basic Markdown formatting
- Deck management (create, edit, delete, list)
- Study sessions with a 4-grade scale and FSRS scheduling
- User accounts and authentication
- Basic analytics on AI quality and usage
- Responsive web UI

**Out of scope for MVP**
- Advanced/custom repetition algorithm beyond FSRS
- Importing files (PDF/DOCX/EPUB)
- Sharing decks between users
- Native mobile apps
- Data export (CSV)
- Browser push notifications
- Public deck library
- Offline mode
- Gamification (points, badges, streaks)
- Advanced editor with images/audio
- Public API for integrations

## Project status
MVP in progress. The PRD defines the full functional scope, user stories, and success metrics.

## License
Not specified. If you plan to open-source this project, add a `LICENSE` file and update this section.
