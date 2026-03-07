# MeetMind Frontend

React frontend for MeetMind - Meeting Intelligence Platform.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 7
- **Routing:** React Router DOM 7
- **Styling:** Tailwind CSS 3
- **Icons:** Lucide React
- **Authentication:** Supabase Auth
- **API Client:** Custom API client for NestJS backend

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── DashboardLayout.tsx
│   │   ├── Dialog.tsx
│   │   ├── InputField.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── Tabs.tsx
│   │
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx
│   │
│   ├── lib/                 # Core utilities
│   │   ├── api.ts           # API client for NestJS backend
│   │   └── supabase.ts      # Supabase client (auth only)
│   │
│   ├── pages/               # Page components
│   │   ├── DashboardPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── MeetingDetailPage.tsx
│   │   ├── MeetingsListPage.tsx
│   │   ├── NewMeetingPage.tsx
│   │   ├── NewMeetingTextPage.tsx
│   │   └── SignupPage.tsx
│   │
│   ├── services/            # Business logic services
│   │   ├── auth.ts
│   │   ├── meetings.ts
│   │   ├── recordings.ts
│   │   ├── summaries.ts
│   │   ├── tasks.ts
│   │   └── transcriptions.ts
│   │
│   ├── types/               # TypeScript types
│   │   └── database.ts
│   │
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
│
├── .env                     # Environment variables
├── package.json
└── vite.config.ts
```

## Installation

```bash
cd frontend
npm install
```

## Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001/api
```

## Running

```bash
# Development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Architecture

### API Gateway Pattern

The frontend follows an API Gateway architecture where all database operations go through the NestJS backend:

```
Frontend (React)
    ↓
NestJS Backend API
    ↓
Supabase (Database + Storage + Edge Functions)
```

### Key Principles

1. **No Direct Database Calls:** All table operations (`meetings`, `tasks`, `summaries`, etc.) go through the NestJS API
2. **Supabase Auth Only:** Direct Supabase usage is limited to `supabase.auth.getSession()` for authentication
3. **Storage Exception:** File uploads use Supabase Storage directly (allowed exception)
4. **Service Layer:** Business logic is organized in service files (`services/`)

### API Client

The `lib/api.ts` file provides a centralized API client that:
- Automatically includes authentication tokens
- Handles errors consistently
- Maps backend responses to frontend types

### Services

Service files in `services/` handle:
- **auth.ts:** Authentication (sign up, sign in, sign out)
- **meetings.ts:** Meeting CRUD operations
- **recordings.ts:** Recording management and file uploads
- **tasks.ts:** Task management
- **summaries.ts:** AI summary operations
- **transcriptions.ts:** Transcription management

## Features

- User authentication (sign up, sign in, sign out)
- Meeting management (create, list, view, update, delete)
- Recording uploads with progress tracking
- AI-powered meeting text analysis
- Task management and tracking
- Meeting intelligence dashboard
- Responsive design with Tailwind CSS

## Development

### Code Style

- TypeScript strict mode enabled
- ESLint configured for React and TypeScript
- Tailwind CSS for styling
- Functional components with hooks

### Component Guidelines

- Components are located in `src/components/`
- Pages are located in `src/pages/`
- Reusable logic goes in `src/services/`
- Types are defined in `src/types/`

## Build

The production build is optimized with:
- Code splitting
- Tree shaking
- Minification
- Asset optimization

Output directory: `dist/`
