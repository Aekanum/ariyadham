# Ariyadham 🙏

A modern, accessible platform for sharing and learning Buddhist teachings (dharma) with support for multiple languages and diverse user needs.

## Project Overview

Ariyadham is designed to democratize access to Buddhist teachings through a thoughtfully built web platform that prioritizes:

- **Accessibility** - Works for elderly users, students, teachers, and busy professionals
- **Cultural Respect** - Features like the "Anjali" (🙏) button reflect dharma values
- **Modern Technology** - Built with Next.js, TypeScript, and Tailwind CSS
- **International** - Thai and English language support from the foundation

## Quick Start

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm 9+ (comes with Node.js)
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ariyadham
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your Supabase credentials:
   - Get these from your Supabase project dashboard
   - Required for database and authentication

4. **Start development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## Technology Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) - React framework with SSR and optimization
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) - Utility-first CSS
- **State Management**: React Context + [Zustand](https://zustand-demo.vercel.app/)

### Backend & Database
- **Backend-as-a-Service**: [Supabase](https://supabase.com/)
  - PostgreSQL database
  - Authentication (email, OAuth)
  - Real-time subscriptions
  - File storage
  - Row-level security (RLS)

### Hosting & Deployment
- **Frontend**: [Vercel](https://vercel.com/) - Optimized Next.js hosting
- **Database**: Supabase on AWS
- **CDN**: Cloudflare
- **Monitoring**: Sentry for error tracking

## Project Structure

```
ariyadham/
├── src/
│   ├── app/                 # Next.js App Router pages and layouts
│   ├── components/          # React components
│   ├── lib/                 # Utilities and helpers
│   ├── hooks/               # Custom React hooks
│   ├── context/             # React Context providers
│   ├── store/               # Zustand state management
│   └── styles/              # Global CSS and styling
├── public/                  # Static assets
│   └── locales/             # i18n translation files
├── docs/                    # Project documentation
│   ├── PRD.md              # Product Requirements Document
│   ├── architecture.md      # Architecture decisions and patterns
│   ├── epics.md             # Epic and story breakdown
│   └── stories/             # Individual story implementations
├── .github/workflows/       # CI/CD pipelines
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── next.config.js           # Next.js configuration
```

## Development

### Available Scripts

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

### Code Quality

- **ESLint**: Configured with Next.js best practices
- **Prettier**: Automatic code formatting
- **TypeScript**: Full type safety
- **Pre-commit Hooks**: Automatic linting before commits (via Husky)

### Git Workflow

```bash
# Make changes
git add .
git commit -m "feat: description of changes"
git push origin feature-branch
```

Commits should follow conventional commit format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Test additions
- `chore:` - Maintenance

## Documentation

- **[Product Requirements (PRD)](./docs/PRD.md)** - Complete feature requirements and success criteria
- **[Architecture](./docs/architecture.md)** - Technical decisions, technology stack, and patterns
- **[Epics & Stories](./docs/epics.md)** - Work breakdown into implementable stories
- **[API Documentation](./docs/API.md)** - API endpoints and contracts (coming)
- **[Development Stories](./docs/stories/)** - Detailed implementation tasks

## Development Phases

### Phase 1 (Weeks 1-2): Foundation
- Project initialization
- Database setup
- Authentication system
- API foundation
- Deployment pipeline

### Phase 2 (Weeks 3-6): Core Features
- User authentication and profiles
- Reader experience (browse, read, bookmark)
- Author CMS (create, edit, publish)

### Phase 3 (Weeks 8-12): Polish & Scale
- Community features (comments, anjali reactions)
- Admin dashboard
- Performance optimization
- i18n and accessibility

## Environment Variables

Create a `.env.local` file with:

```
# Required: Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Sentry error tracking
NEXT_PUBLIC_SENTRY_DSN=

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ NEVER commit `.env.local` - it contains secrets!**

## Contributing

1. Read the [Architecture](./docs/architecture.md) for implementation patterns
2. Check [Stories](./docs/stories/) for the feature you're working on
3. Follow code quality guidelines (ESLint, Prettier, TypeScript)
4. Write tests for your changes
5. Submit pull request

## Accessibility

This project prioritizes accessibility:
- ✅ WCAG 2.1 AA compliance
- ✅ Keyboard navigation support
- ✅ Dark mode for reduced eye strain
- ✅ Adjustable font sizes
- ✅ Responsive design for all devices
- ✅ Special mode for elderly users

## Performance

Target metrics (from architecture):
- **FCP (First Contentful Paint)**: < 1.5 seconds
- **LCP (Largest Contentful Paint)**: < 2.5 seconds
- **CLS (Cumulative Layout Shift)**: < 0.1
- **SEO Score**: > 85/100

## Deployment

### Preview Deployments
- Automatically created for pull requests
- Share with stakeholders before merging

### Production
- Automatically deployed to vercel.com when pushed to `main`
- Database migrations must be manually approved
- Use environment variables for secrets

## Troubleshooting

### Port 3000 already in use
```bash
# Find and kill the process using port 3000
lsof -i :3000
kill -9 <PID>

# Or use a different port
npm run dev -- -p 3001
```

### TypeScript errors
```bash
npm run type-check  # Check all TypeScript errors
```

### Node modules issues
```bash
rm -rf node_modules package-lock.json
npm install
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)

## License

[To be determined]

## Contact

For questions or contributions, please reach out to Aekanum.

---

**Status**: 🚀 Ready for development
**Last Updated**: 2025-11-07
**Story**: 1.1 - Project Setup & Repository Structure
