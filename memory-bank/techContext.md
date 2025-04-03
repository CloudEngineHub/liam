# Technical Context

## Technologies Used
- **AI Components**: Utilized for analyzing migration impacts and providing intelligent suggestions.
- **LangChain**: Framework for developing applications powered by language models, used for AI review generation and schema metadata suggestions.
- **OpenAI**: Provider of AI models used for generating schema reviews and metadata suggestions.
- **Trigger.dev**: Task orchestration platform used for implementing the review pipeline and knowledge suggestion tasks.
- **GitHub App**: Integrated to automate comments and review approvals on PRs, with enhanced API usage for fetching PR descriptions and comments.
- **Prisma**: ORM for database access and management (currently being phased out).
- **Supabase JS**: JavaScript client for Supabase, used for database access with support for optimized queries using nested joins. Planned to replace Prisma across all components.
- **Supabase RPC**: Remote Procedure Call functionality in Supabase, planned for future implementation of robust transaction management across the application.
- **AWS**: Deployed in the us-east-1 region for its high affinity with English-speaking markets and potential for future multi-region expansion.
- **TypeScript**: Strongly-typed programming language that builds on JavaScript.
- **React 18**: UI library for building component-based interfaces.
- **Next.js 15**: React framework for server-rendered applications.
- **Vite**: Build tool used in CLI for static site generation.
- **Valtio**: State management.
- **@xyflow/react (React Flow)**: Diagram visualization.
- **Fumadocs**: Documentation site.
- **CSS Modules**: For styling HTML elements with typed definitions.
- **Radix UI**: For UI primitives.
- **Lucide React**: For consistent iconography.

## Development Setup
- The product is integrated with existing development workflows through its GitHub App, allowing for seamless automation and review processes.
- The system is designed to be modular, enabling easy integration and extension of features.
- **Task Pipeline**: A series of tasks are chained together using Trigger.dev to form a complete review workflow, including schema metadata generation.
- **Function Separation**: Business logic is separated into dedicated function files that are called from task definitions.
- **Type Safety**: When working with Supabase, type assertions are used to bridge the gap between Supabase's types and the application's expected types, particularly for nested queries and bigint fields.
- **Enhanced Prompt Structure**: AI prompts are structured to incorporate multiple sources of context, including PR descriptions, comments, documentation, schema files, and code changes.
- **Package Management**: pnpm for efficient dependency management.
- **Monorepo Management**: pnpm workspaces.
- **Build System**: Turborepo for optimized builds.
- **Linting & Formatting**: Biome for code quality.
- **Testing**: Vitest for unit testing, Playwright for e2e testing.
  - **Supabase Testing Approach**: A direct testing approach is used with Supabase. We create real records in the database, run the actual functions with these records, and then clean up the test data afterwards. This provides more realistic tests that verify the actual functions with real database interactions, leveraging Supabase's ability to be executed directly in test environments.

## Code Implementation Guidelines
- Use TypeScript for all components and functions.
- Use early returns whenever possible to make the code more readable.
- Always use CSS Modules for styling HTML elements.
- Use descriptive variable and function/const names. Event functions should be named with a "handle" prefix.
- Implement accessibility features on elements.
- Use consts instead of functions (e.g., "const toggle = () =>") and define types when possible.
- Do not code within the `page.tsx` file in Next.js App Router. Instead, create a separate `XXXPage` component.
- Follow the `tsconfig.json` paths settings and always use the correct alias for import paths.
- Align data fetching responsibilities with the component's role (server vs. client-side).

## Component Implementation Guidelines
- Avoid using `default export`; always use `named export`.
- When styling, prioritize using CSS Variables from the `@liam-hq/ui` package.
- Prefer using UI components provided by `@liam-hq/ui` over custom implementations.
- When using icons, always import them from `@liam-hq/ui`.

## Technical Constraints
- The product must coexist with its OSS version, offering high-value features in paid plans to ensure a sustainable business model.
- The AI components require continuous learning from past reviews to improve accuracy and relevance over time.
- During the transition from Prisma to Supabase JS, both database access methods will coexist, requiring careful coordination to ensure consistent data access patterns.
- Type compatibility issues between Prisma and Supabase require careful handling, particularly for bigint fields and nested relationships.
- Schema metadata generation requires accurate analysis of database schema changes and proper integration with the knowledge suggestion system.

## Dependencies
- **AWS**: Used for deployment, with a focus on the us-east-1 region.
- **GitHub**: Essential for integration and automation of review processes.
- **AI Services**: Required for the intelligent analysis and suggestion features.
- **Vercel**: Deployment of web applications.
- **GitHub Actions**: CI/CD for continuous integration.
