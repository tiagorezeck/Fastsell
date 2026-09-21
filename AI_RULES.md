# PDV FAST PRO Development Rules & Tech Stack

## Tech Stack
- **React 19**: Modern UI library using Functional Components and Hooks.
- **TypeScript**: Strongly typed codebase for better maintainability and error catching.
- **Tailwind CSS**: Utility-first styling for rapid, responsive, and consistent UI design.
- **Lucide React**: Comprehensive and consistent icon library.
- **Vite**: High-performance build tool and development server.
- **LocalStorage Persistence**: Client-side data storage via a centralized `db.ts` utility.
- **Component-Based Architecture**: Modular UI components located in the `components/` directory.

## Development Rules

### 1. Styling & Design
- **Tailwind Only**: Use Tailwind CSS utility classes for all styling. Avoid creating new CSS files.
- **Aesthetic Consistency**: Follow the "Modern/Bold" theme:
  - Use large border radiuses (`rounded-2xl`, `rounded-3xl`, `rounded-[2rem]`).
  - Use the `indigo` and `slate` color palettes for primary actions and backgrounds.
  - Use `font-black` for headings and `font-bold` for emphasis.
- **Responsiveness**: Always ensure components work on mobile and desktop using Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`).

### 2. Icons
- **Lucide React**: Use `lucide-react` for all icons. Do not install other icon libraries unless absolutely necessary.

### 3. Data Management
- **Types**: All data structures must be defined in `types.ts`.
- **Persistence**: Use the `loadDB` and `saveDB` functions from `db.ts`. Do not access `localStorage` directly within components.
- **State**: Keep the global application state in `App.tsx` and pass down necessary data/setters via props.

### 4. Component Structure
- **Modularity**: Create small, focused components. If a component exceeds 100 lines, consider refactoring it into smaller sub-components.
- **Modals**: Use the existing `Modal.tsx` component for all overlay interactions to maintain UI consistency.

### 5. Code Quality
- **No Placeholders**: Never use "TODO" or partial implementations. All code must be fully functional.
- **Error Handling**: Let errors bubble up unless a specific user-facing error message is required.