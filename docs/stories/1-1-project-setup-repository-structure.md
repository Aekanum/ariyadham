# Story 1.1: Project Setup & Repository Structure

**Epic:** 1 - Foundation & Infrastructure
**Story ID:** 1.1
**Status:** IN PROGRESS
**Priority:** CRITICAL (Must complete first - blocks all other work)
**Date Started:** 2025-11-07

---

## Story Statement

As a **developer**,
I want a **well-organized project structure with build systems and dependency management configured**,
So that **all team members can quickly understand the codebase and contribute efficiently**.

---

## Acceptance Criteria

### Given
- An empty Git repository ready for the Ariyadham project
- Node.js 18+ and npm 9+ installed locally

### When
1. Developer clones the repository
2. Developer reviews the project structure
3. Developer runs `npm install`
4. Developer runs `npm run dev`
5. Developer runs `npm run build`

### Then
✅ The following structure exists:
- `/src` folder with TypeScript support configured
- `/public` folder for static assets
- `/docs` folder containing documentation
- Root configuration files (`.gitignore`, `.env.example`, `README.md`, etc.)
- All critical dependencies installed and versions locked in `package-lock.json`

✅ Running `npm run dev` starts the development server on `http://localhost:3000`

✅ Running `npm run build` creates an optimized production build without errors

✅ Code quality tools configured and working:
- ESLint for code linting
- Prettier for code formatting
- Pre-commit hooks with husky for automatic checks
- TypeScript type checking enabled

✅ Development experience:
- IDE recognizes TypeScript paths and imports correctly
- Hot reload works when files are modified
- Errors are displayed clearly in terminal and browser
- Build process is fast (< 30 seconds for initial build)

---

## Prerequisites

None - this is the first story in Epic 1 (Foundation).

---

## Technical Notes

### Technology Stack (from Architecture)
- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript 5.0+
- **Styling:** Tailwind CSS 3.3+
- **Package Manager:** npm (not yarn or pnpm)
- **Build System:** Next.js built-in (Webpack)
- **Deployment:** Vercel (with GitHub integration)

### Initialization Command

Use the official Next.js starter with these exact flags:

```bash
npx create-next-app@latest ariyadham \
  --typescript \
  --tailwind \
  --app \
  --eslint \
  --src-dir \
  --import-alias '@/*' \
  --no-git \
  --use-npm
```

**Flag Explanations:**
- `--typescript` - Enable TypeScript
- `--tailwind` - Include Tailwind CSS
- `--app` - Use App Router (not Pages Router)
- `--eslint` - Include ESLint configuration
- `--src-dir` - Create src/ directory
- `--import-alias '@/*'` - Setup path alias for cleaner imports
- `--no-git` - Don't initialize git (we'll do it separately)
- `--use-npm` - Use npm as package manager

### Project Structure to Create

After initialization, the structure should look like:

```
ariyadham/
├── .github/
│   └── workflows/
│       ├── test.yml
│       ├── deploy.yml
│       └── preview.yml
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   └── styles/
├── public/
│   ├── favicon.ico
│   └── locales/ (create for i18n)
├── docs/
│   ├── stories/
│   ├── PRD.md
│   ├── architecture.md
│   ├── epics.md
│   └── API.md (create)
├── .env.example
├── .env.local (DO NOT COMMIT - add to .gitignore)
├── .eslintrc.json
├── .prettierrc.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

### Setup Steps

1. **Create project with Next.js starter**
   ```bash
   cd /Users/aphichat/Projects
   npx create-next-app@latest ariyadham [flags above]
   ```

2. **Navigate to project**
   ```bash
   cd ariyadham
   ```

3. **Initialize Git**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Next.js project setup"
   ```

4. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with Supabase keys (from project dashboard)
   ```

5. **Install additional dev dependencies**
   ```bash
   npm install --save-dev husky lint-staged
   npx husky install
   ```

6. **Setup pre-commit hooks**
   - Create `.husky/pre-commit` to run linting
   - Add lint-staged config to package.json

7. **Verify everything works**
   ```bash
   npm run dev      # Should start on localhost:3000
   npm run build    # Should complete successfully
   npm run lint     # Should show no errors
   ```

### Configuration Files to Create/Modify

**`.env.example`** (for documentation)
```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Analytics (optional)
NEXT_PUBLIC_SENTRY_DSN=
```

**`.prettierrc.json`** (code formatting)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**`tsconfig.json`** (ensure paths are configured)
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### package.json Scripts to Add

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

### Documentation to Create

**`README.md`** - Include:
- Project description
- Technology stack
- Setup instructions
- Development workflow
- Deployment instructions
- Contributing guidelines

**`docs/API.md`** - Placeholder for API documentation

### Known Dependencies

From architecture, these dependencies should be installed:

**Core:**
- `next@14+`
- `react@18.2+`
- `typescript@5+`

**Styling:**
- `tailwindcss@3.3+`
- `postcss@8+`
- `autoprefixer@10+`

**Development:**
- `eslint@8+`
- `eslint-config-next`
- `prettier@3+`
- `husky@8+`
- `lint-staged@15+`

Later stories will add:
- `zustand` (state management)
- `@supabase/supabase-js` (backend client)
- `next-i18next` (internationalization)
- `vitest` (testing)
- `@testing-library/react` (component testing)

### Success Metrics

✅ Developer can clone repo and have a working environment in < 5 minutes
✅ TypeScript compiler shows no errors
✅ ESLint reports no errors
✅ Development server starts without warnings
✅ Build completes in < 30 seconds
✅ Project structure matches architecture specification
✅ All team members can understand the layout

---

## Implementation Tasks

- [ ] Execute Next.js create-next-app with specified flags
- [ ] Verify project structure matches requirements
- [ ] Create/configure .env.example with Supabase placeholders
- [ ] Setup pre-commit hooks with husky and lint-staged
- [ ] Configure Prettier formatting rules
- [ ] Add/verify TypeScript configuration (paths)
- [ ] Update package.json scripts
- [ ] Create comprehensive README.md
- [ ] Create docs/API.md placeholder
- [ ] Verify `npm run dev` starts successfully
- [ ] Verify `npm run build` completes successfully
- [ ] Verify `npm run lint` works without errors
- [ ] Commit to Git with clear commit message
- [ ] Document setup process for team

---

## Definition of Done

- ✅ Code committed to repository
- ✅ All automated checks pass (linting, type checking)
- ✅ Development environment is fully functional
- ✅ README and setup documentation complete
- ✅ Team can clone and start developing
- ✅ Story marked as DONE in sprint-status.yaml

---

## Related Stories

**Depends on:** None (this is the first story)

**Blocks:**
- Story 1.2 (Database Schema) - needs project initialized
- Story 1.3 (Authentication) - needs project initialized
- Story 1.4 (Deployment) - needs Git repo setup
- Story 1.5 (API Foundation) - needs project initialized
- Story 1.6 (Core Utilities) - needs project initialized
- All other stories

**Related:**
- Story 1.4 (Deployment Pipeline) - should know about this project structure

---

## Implementation Notes

### Architecture References
- See `docs/architecture.md` Section "Project Structure" for complete file layout
- See "Decision Summary" table for technology versions

### Decisions Already Made
- ✅ Framework: Next.js 14+ (decided in architecture)
- ✅ Language: TypeScript (decided in architecture)
- ✅ Styling: Tailwind CSS (decided in architecture)
- ✅ Package Manager: npm (decided in architecture)

### No Decisions Needed
All technical choices for project setup are already determined in the architecture document.

### Common Pitfalls to Avoid
- ❌ Don't use Yarn or pnpm - architecture specifies npm
- ❌ Don't use Pages Router - architecture specifies App Router
- ❌ Don't commit .env.local - add to .gitignore
- ❌ Don't skip pre-commit hooks - needed for team consistency
- ❌ Don't ignore TypeScript errors - type safety is critical

---

## Context & Rationale

This story is foundational. It establishes:
1. **Development Environment** - All developers use same setup
2. **Code Quality Tools** - Linting and formatting from day one
3. **Project Structure** - Matches architecture specification
4. **Version Control** - Git repo is ready for collaboration
5. **Documentation** - Setup process is clear for new team members

Completing this story well prevents many downstream issues and enables all subsequent work.

---

## Actual Implementation

### Step 1: Execute Project Setup

```bash
cd /Users/aphichat/Projects
npx create-next-app@latest ariyadham \
  --typescript \
  --tailwind \
  --app \
  --eslint \
  --src-dir \
  --import-alias '@/*' \
  --no-git \
  --use-npm
```

### Step 2: Move existing docs into project

The project already has documentation at `/Users/aphichat/Projects/ariyadham/docs/`.
The new project will be in same location, so we'll integrate the docs structure.

### Step 3: Setup Git

```bash
cd ariyadham
git init
git add .
git commit -m "feat: Initialize Ariyadham project with Next.js 14

- Setup Next.js with TypeScript and Tailwind CSS
- Configure ESLint and Prettier for code quality
- Create project structure following architecture spec
- Prepare for Supabase integration (Story 1.2)

Story: 1.1 - Project Setup & Repository Structure"
```

### Step 4: Configure environment variables

Create `.env.local` with Supabase credentials (to be filled in)

---

## Status Updates

- **2025-11-07:** Story created and ready for implementation
- **Status:** READY TO START

---

_Story 1.1 is the gateway to all other development work. Complete it thoroughly and ensure team can reproduce the setup._
