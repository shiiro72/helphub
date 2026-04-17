## Tech Stack

- **Framework:** Next.js (App Router), TypeScript, Tailwind CSS
- **Icons:** Lucide React
- **Database:** Supabase (Auth)
- **Styling:** Minimalist, clean
- **Documentation:** Storybook
- **Icons:** Lucide React

## Coding Conventions

- **Naming:** use PascalCase for Components, camelCase for functions/variables
- **Directories:**
  - `components/` for reusable components, use atomic design pattern(atoms, molecules, components)
  - `lib/` for shared logic (APIs)
  - `app/api/` for route handlers.
- **Safe Keys:** Never hardcode secrets. Always use `process.env`. Reference `.env.example` for variable names
