# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an e-commerce auto parts store ("Автозапчасти АСО") built with Next.js 15.3.3 using the App Router architecture. The project is in its initial setup phase and will be developed following Feature-Sliced Design (FSD) principles.

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Architecture

### Current Tech Stack
- **Framework**: Next.js 15.3.3 with App Router
- **UI**: React 19.0.0
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5

### Planned Architecture (per tech specification)
The project will follow Feature-Sliced Design (FSD) with this structure:
- `app/` - Next.js App Router (routing only)
- `widgets/` - Self-contained UI blocks
- `features/` - User scenarios
- `entities/` - Business entities
- `shared/` - Reusable code (ui, lib, types, constants)

### Planned Integrations
- **UI Components**: Mantine UI 8.1.0+
- **Database**: PostgreSQL 17 with Prisma ORM
- **Caching**: Redis 8.0.2
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **Authentication**: JWT with httpOnly cookies

## Key Features to Implement

1. SMS-based user authentication
2. Product catalog with categories and vehicle compatibility
3. Shopping cart and favorites
4. Order management system
5. Admin panel
6. Chat support
7. Integration with 1C accounting system

## Important Notes

- The application is configured for Russian language (lang="ru")
- Follow FSD principles: imports only go downward (widgets → features → entities → shared)
- All business logic should be extracted from app/ directory into appropriate FSD layers
- Tailwind CSS is used for utility classes, while Mantine provides main components
- No Docker - all services run directly on Ubuntu 22.04 VPS