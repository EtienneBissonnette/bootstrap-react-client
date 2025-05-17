# Testable Landing Page

A bootstrap project using React v19, TypeScript, Vite v6, and Vitest v3. Includes foundational structure for a landing page, authentication, and a contact form, designed for testability and potential OAuth integration. Configured for Dockerization.

## Technologies

- **Frontend:** React v19, TypeScript
- **Bundler:** Vite v6
- **Routing:** React Router DOM v7
- **Testing:** Vitest v3 (with JSDOM, MSW, Coverage)
- **Linting:** ESLint v9 (with TypeScript, React Hooks, React Refresh plugins)
- **Utilities:** Concurrently

## Features

- Fast development server and production builds with Vite.
- Client-side routing with React Router DOM.
- Integrated testing suite with Vitest (unit/component tests, UI, coverage).
- API mocking capabilities using MSW.
- Pre-configured structure for Landing, Auth, and Contact pages.
- Ready for OAuth integration (implementation details required).
- ESLint configured for TypeScript and React best practices.
- Containerization ready with Docker Compose.

## Prerequisites

- Node.js (LTS recommended, >=18)
- npm (comes with Node.js)
- Docker & Docker Compose (optional, for containerized workflow)

## Getting Started

1.  Clone the repository: `git clone <repository-url>`
2.  Navigate into the project directory: `cd testable-landing-page`
3.  Install dependencies: `npm install`

## Available Scripts

- `npm run dev`: Starts development server (React app) at `http://localhost:5173`.
- `npm run build`: Builds the project for production (`dist` folder).
- `npm run lint`: Runs ESLint code analysis.
- `npm test`: Runs Vitest tests (headless).
- `npm run test:ui`: Runs Vitest tests and opens the UI at `http://localhost:51204/__vitest__/#/`.
- `npm run dev-and-test`: Runs `dev` and `test:ui` concurrently.
- `npm run coverage`: Runs tests and generates coverage report (`./coverage`).

## Configuration Highlights

- **Vite (`vite.config.ts`):** Configures dev server port (5173), `@` path alias for `src`, and Vitest settings (jsdom env, setup files, coverage).
- **TypeScript (`tsconfig.*.json`):** Sets up TS for app code and Node.js files, including strict linting rules and the `@` alias.
- **ESLint (`eslint.config.js`):** Configures linting using recommended rules for JS/TS, React Hooks, and React Refresh.

## Testing

- Vitest is the test runner.
- Tests are located in the `src/tests` directory.
- `src/tests/setup.ts` is run before tests for setup (e.g., Jest-DOM, MSW).
- Use `npm test` or `npm run test:ui` to run tests. `npm run coverage` to generate reports.

## OAuth Setup

The project provides the basic structure and dependencies to integrate an OAuth solution. Specific integration logic needs to be added based on your chosen provider.

## Project Structure (`src/`)

src/

- api/              # API related files (e.g., MSW handlers)
- assets/           # Static assets used by components
- components/       # Reusable UI components
- hooks/            # Custom React hooks
- pages/            # Application pages (Landing, Auth, Contact, etc.)
- providers/        # Context providers or other global state managers
- styles/           # Global or component-specific styles
- tests/            # Test setup files and utilities
- types/            # TypeScript type definitions
- App.tsx           # Root React component
- main.tsx          # Application entry point
- vite-env.d.ts     # Vite environment type definitions

## Deployment

Build the project using `npm run build`. The static assets will be in the `dist` folder. Serve this folder using any static web server (or within a Docker container as configured).

## License

This project is licensed under the [MIT License](./LICENSE).
