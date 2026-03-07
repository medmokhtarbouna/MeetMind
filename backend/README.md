# MeetMind Backend

NestJS API Gateway for MeetMind - Meeting Intelligence Platform.

## Architecture

```
Frontend (React) → NestJS API → Supabase (DB + Storage + Edge Functions)
```

The backend acts as a thin API gateway layer that:
- Forwards authenticated requests to Supabase
- Validates input using DTOs
- Orchestrates AI operations via Gemini API
- Invokes Supabase Edge Functions for transcription/summarization

## Project Structure

```
backend/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   │
│   ├── supabase/                  # Supabase client service
│   ├── meetings/                  # Meetings CRUD + participants
│   ├── recordings/                # Audio recordings management
│   ├── tasks/                     # Meeting tasks CRUD
│   ├── summaries/                 # AI summaries CRUD
│   ├── transcriptions/            # Transcriptions CRUD
│   ├── transcribe/                # Edge Function: transcribe
│   ├── summarize/                 # Edge Function: summarize
│   └── meeting-text/              # Gemini AI text processing
│
├── database/
│   ├── migrations/                # SQL migration files
│   ├── run-migrations.ts          # Migration runner
│   └── seed.ts                    # Database seeder
│
├── .env                           # Environment variables
└── package.json
```

## Installation

```bash
cd backend
npm install
```

## Environment Variables

Create a `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
PORT=3001
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```

## Running

```bash
# Development (with hot reload)
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Database Commands

```bash
# Run migrations (shows instructions for Supabase SQL Editor)
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Reset database (migrate + seed)
npm run db:reset
```

## API Endpoints

All endpoints require: `Authorization: Bearer <supabase_access_token>`

### Meetings

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/meetings` | Create meeting |
| GET | `/api/meetings` | List all meetings |
| GET | `/api/meetings/:id` | Get meeting with full intelligence |
| PATCH | `/api/meetings/:id` | Update meeting |
| DELETE | `/api/meetings/:id` | Delete meeting |

### Participants

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/meetings/:id/participants` | Add participant |
| PATCH | `/api/meetings/:id/participants/:userId` | Update participant role |
| DELETE | `/api/meetings/:id/participants/:userId` | Remove participant |

### Recordings

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/recordings` | Create recording metadata |
| GET | `/api/recordings/meeting/:meetingId` | List recordings by meeting |
| GET | `/api/recordings/:id` | Get recording |
| DELETE | `/api/recordings/:id` | Delete recording |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/my` | List my assigned tasks |
| GET | `/api/tasks/meeting/:meetingId` | List tasks by meeting |
| GET | `/api/tasks/:id` | Get task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Summaries

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/summaries` | Create summary |
| GET | `/api/summaries/meeting/:meetingId` | Get summary by meeting |
| GET | `/api/summaries/:id` | Get summary |
| PATCH | `/api/summaries/:id` | Update summary |
| DELETE | `/api/summaries/:id` | Delete summary |

### Transcriptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transcriptions` | Create transcription |
| GET | `/api/transcriptions/recording/:recordingId` | Get by recording |
| GET | `/api/transcriptions/:id` | Get transcription |
| PATCH | `/api/transcriptions/:id` | Update transcription |
| DELETE | `/api/transcriptions/:id` | Delete transcription |

### AI Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transcribe` | Transcribe audio (Edge Function) |
| POST | `/api/summarize` | Generate AI summary (Edge Function) |
| POST | `/api/meeting-text/process` | Process meeting text (Gemini AI) |

## Tech Stack

- **Framework:** NestJS 10
- **Database:** Supabase (PostgreSQL)
- **AI:** Google Gemini API
- **Validation:** class-validator
- **Language:** TypeScript
