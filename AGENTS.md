# AGENTS.md

## Project Context

This is a single-company CRM application (BnBWeb) built with React and Supabase. The system provides real-time synchronization across all users for tasks, clients, calendar notes, and message templates. Treat it as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

Start with `README.md` for local setup, environment variables, and publish workflow.

## Technology Stack

- **Frontend**: React + Vite
- **Backend**: Supabase (PostgreSQL + Realtime + Auth)
- **UI Components**: shadcn/ui components in `ui/` directory
- **State Management**: React hooks with Supabase Realtime subscriptions
- **Styling**: TailwindCSS

## Key Files and Directories

- `board/`: Kanban board view and task management components
- `sales/`: Sales page, client management, and messaging components
- `pages/`: Page components (Tasks, Calendar, Sales)
- `lib/`: Core utilities and API modules
  - `lib/supabaseClient.js`: Supabase client configuration
  - `lib/api/`: API modules (tasks, clients, columns, calendar-notes, message-templates, boards)
  - `lib/hooks/`: React hooks including realtime subscriptions
  - `lib/kanban-utils.jsx`: Kanban utilities and ensureBoard function
- `ui/`: shadcn/ui components
- `supabase/migrations/`: SQL database migrations
- `supabase/diagnostics/`: Diagnostic SQL scripts (not migrations)
- `Layout.jsx`: Main application layout with sidebar
- `App.jsx`: Application routing and providers

## Architecture Notes

- **Single Company Model**: The system operates as a single-company CRM (BnBWeb) with no multi-tenancy
- **Global Real-time Sync**: All data is shared across all authenticated users via Supabase Realtime
- **No Project Filtering**: Removed all `project_id` and `board_id` filtering for global data access
- **RLS Policies**: Row Level Security allows all authenticated users full access to shared data
- **Realtime Hooks**: Custom hooks in `lib/hooks/` manage Supabase Realtime subscriptions with global channel pattern

## Working Notes

- Use `npm run dev` for local development
- Environment variables in `.env.local` for Supabase configuration
- Real-time subscriptions use global channels to prevent conflicts across components
- All API update methods use diff-based updates (only changed fields) to minimize conflicts
- Kanban reordering uses fractional positioning to avoid reordering entire columns
- Run the relevant checks from `package.json` before finishing code changes.
