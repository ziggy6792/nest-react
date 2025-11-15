# Demo: NestJS + React

A full-stack TypeScript monorepo demonstrating a modern API and web application setup.

## Overview

This project showcases a complete development stack with:

- **API**: NestJS backend with Drizzle ORM and Swagger documentation
- **Web**: React frontend built with Vite and Orval for type-safe API clients

## Tech Stack

### API (`apps/api`)

- **[NestJS](https://nestjs.com/)** - Progressive Node.js framework for building efficient and scalable server-side applications
- **[Drizzle ORM](https://orm.drizzle.team/)** - TypeScript ORM with SQLite (via LibSQL)
- **[Swagger](https://swagger.io/)** - API documentation and interactive API explorer
- **[Vitest](https://vitest.dev/)** - Fast unit testing framework
- **[class-validator](https://github.com/typestack/class-validator)** & **[class-transformer](https://github.com/typestack/class-transformer)** - DTO validation and transformation

### Web (`apps/web`)

- **[Vite](https://vitejs.dev/)** - Next-generation frontend build tool
- **[React](https://react.dev/)** - UI library
- **[Orval](https://orval.dev/)** - Generate type-safe API clients from OpenAPI/Swagger specs
- **[TanStack Query](https://tanstack.com/query)** - Powerful data synchronization for React
- **[Vitest](https://vitest.dev/)** - Unit testing with React Testing Library
- **[MSW](https://mswjs.io/)** - API mocking for tests

### Monorepo

- **[Turborepo](https://turbo.build/repo)** - High-performance build system for JavaScript and TypeScript codebases
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager
- **TypeScript** - Type-safe development throughout

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm 8.15.6

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Run both API and Web in development mode
pnpm dev

# Or run individually:
cd apps/api && pnpm dev    # API runs on http://localhost:3001
cd apps/web && pnpm dev    # Web runs on http://localhost:3000
```

### API Development

```bash
cd apps/api

# Database migrations
pnpm db:generate    # Generate migration files
pnpm db:migrate     # Run migrations
pnpm db:push        # Push schema changes directly
pnpm db:studio      # Open Drizzle Studio (database GUI)

# Testing
pnpm test           # Run unit tests
pnpm test:e2e       # Run end-to-end tests
pnpm test:cov       # Run tests with coverage

# Type checking
pnpm typecheck
```

### Web Development

```bash
cd apps/web

# Generate API client from Swagger spec
pnpm generate:api   # Regenerate type-safe API client using Orval

# Testing
pnpm test          # Run unit tests
pnpm test:watch    # Run tests in watch mode
pnpm test:ui       # Run tests with Vitest UI

# Type checking
pnpm typecheck
```

## Project Structure

```
kitchen-sink/
├── apps/
│   ├── api/              # NestJS backend
│   │   ├── src/
│   │   │   ├── users/    # User module (controller, service, DTOs)
│   │   │   ├── server/
│   │   │   │   └── db/   # Drizzle schema and database setup
│   │   │   └── utils/    # Shared utilities
│   │   └── drizzle/      # Migration files
│   └── web/              # React frontend
│       ├── src/
│       │   ├── api/      # Generated API client (Orval)
│       │   ├── components/
│       │   └── app/
│       └── orval.config.ts
├── packages/             # Shared packages
│   ├── config-eslint/   # ESLint configurations
│   ├── config-typescript/ # TypeScript configurations
│   └── jest-presets/    # Jest configurations
└── turbo.json           # Turborepo configuration
```

## Features

### API Features

- RESTful API with NestJS
- Type-safe database queries with Drizzle ORM
- Automatic API documentation with Swagger (available at `/swagger`)
- DTO validation with class-validator
- Database migrations with Drizzle Kit
- Comprehensive test coverage

### Web Features

- Type-safe API client generation from Swagger spec
- React Query for efficient data fetching and caching
- Real-time search functionality
- Component-based architecture
- TypeScript throughout for type safety

## API Endpoints

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create a new user
- `GET /users/findNames?firstName=...&lastName=...` - Search users by name

API documentation is available at `http://localhost:3001/swagger` when the API is running.

## Scripts

### Root Level

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps
- `pnpm test` - Run tests across all apps
- `pnpm lint` - Lint all code
- `pnpm format` - Format code with Prettier
- `pnpm check-types` - Type check all TypeScript code

## License

UNLICENSED
