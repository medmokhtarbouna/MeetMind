# MeetMind

**MeetMind** is an AI-powered meeting intelligence platform built to transform meeting content into clear, structured, and actionable outputs. It helps users turn raw conversations into usable outcomes such as summaries, decisions, key points, action items, and tasks, while reducing the friction usually associated with reviewing recordings or unstructured notes.

Whether the input comes from an audio recording or direct meeting text, the system processes it into the same consistent intelligence layer that can be stored, reviewed, and acted upon.

---

## 1. Project Objective

The objective of MeetMind is to convert meeting content into structured, actionable results that improve clarity, follow-up, and accountability after meetings.

---

## 2. Overall Architecture

```text
Frontend (React)
      ↓
NestJS API Gateway
      ↓
Supabase
 ├── PostgreSQL
 ├── Storage
 ├── Auth
 └── Edge Functions
```

### Audio Pipeline

```text
Audio meeting
   ↓
File upload + recording metadata creation
   ↓
Edge Function (transcription / OpenAI)
   ↓
Transcript
   ↓
AI summary generation
   ↓
Structured output
   ↓
Supabase tables
```

### Text Pipeline

```text
Meeting text
   ↓
NestJS backend
   ↓
Gemini AI
   ↓
Structured output
   ↓
Supabase tables
```

---

## 3. Technical Stack

### Frontend

* React 19
* TypeScript
* Vite
* React Router DOM
* Tailwind CSS
* Lucide React

### Backend

* NestJS 10
* TypeScript
* class-validator
* class-transformer

### Database / BaaS

* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Storage
* Supabase Edge Functions

### Artificial Intelligence

* **OpenAI** for audio meeting processing
* **Gemini** for text meeting analysis

---

## 4. Main Features

### Authentication

* sign up
* sign in
* sign out
* authentication via Supabase Auth

### Meeting Management

* create meetings
* list meetings
* view meeting details
* update meetings
* delete meetings

### Audio Meetings

* upload an audio file
* create recording metadata
* transcribe audio
* generate structured AI summaries
* save outputs to the database

### Text Meetings

* add meeting text
* process content via Gemini
* generate the same structured outputs as audio meetings
* save outputs to the database

### Extracted Intelligence

For each meeting, the system can produce:

* `summary`
* `action_items`
* `decisions`
* `key_points`
* `keywords`
* `tasks`

---

## 5. Project Structure

```text
project-root/
│
├── backend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── supabase/
│   │   ├── meetings/
│   │   ├── recordings/
│   │   ├── tasks/
│   │   ├── summaries/
│   │   ├── transcriptions/
│   │   ├── transcribe/
│   │   ├── summarize/
│   │   └── meeting-text/
│   │
│   ├── database/
│   │   ├── migrations/
│   │   ├── run-migrations.ts
│   │   └── seed.ts
│   │
│   ├── package.json
│   └── .env
│
└──  frontend/
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   ├── lib/
    │   ├── pages/
    │   ├── services/
    │   ├── types/
    │   ├── App.tsx
    │   └── main.tsx
    │
    ├── package.json
    └── .env
```

---

## 6. Data Schema

The main tables used are:

### `users`

Application-level user information:

* `id`
* `email`
* `full_name`

### `meetings`

Meetings created by users:

* `id`
* `owner_id`
* `title`
* `description`
* `scheduled_at`

### `recordings`

Audio file metadata:

* `id`
* `meeting_id`
* `uploader_id`
* `storage_path`
* `file_name`
* `mime_type`
* `duration_seconds`

### `transcriptions`

Text transcribed from a recording:

* `id`
* `recording_id`
* `language`
* `text`

### `ai_summaries`

Structured AI outputs:

* `id`
* `meeting_id`
* `summary`
* `action_items`
* `decisions`
* `key_points`
* `keywords`

### `tasks`

Automatically extracted tasks:

* `id`
* `meeting_id`
* `title`
* `assigned_to`
* `status`
* `deadline`

---

## 7. AI Processing Modes

MeetMind supports two complementary AI processing modes, depending on the format of the meeting input.

### A. Audio Meeting Processing

Used when the user provides a recorded meeting. In this flow, the system:
1. uploads the audio file
2. creates a recording entry
3. sends the recording through the audio processing pipeline
4. uses **OpenAI** for transcription and meeting intelligence extraction
5. persists the generated outputs to the relational database

### B. Text Meeting Processing

Used when the user already has the textual content of the meeting. In this flow, the NestJS backend sends the meeting text directly to **Gemini** in order to generate the same structured outputs.

### Output Consistency

Although the AI providers differ by input type, both flows are designed to produce the same structured result model, including:
- summaries
- action items
- decisions
- key points
- keywords
- tasks

This keeps the platform consistent at the data and product levels, regardless of whether the meeting starts as audio or text.

---

## 8. REST API

All routes use:

```http
Authorization: Bearer <supabase_access_token>
```

### Meetings

* `POST /api/meetings`
* `GET /api/meetings`
* `GET /api/meetings/:id`
* `PATCH /api/meetings/:id`
* `DELETE /api/meetings/:id`

### Participants

* `POST /api/meetings/:id/participants`
* `PATCH /api/meetings/:id/participants/:userId`
* `DELETE /api/meetings/:id/participants/:userId`

### Recordings

* `POST /api/recordings`
* `GET /api/recordings/meeting/:meetingId`
* `GET /api/recordings/:id`
* `DELETE /api/recordings/:id`

### Tasks

* `POST /api/tasks`
* `GET /api/tasks/my`
* `GET /api/tasks/meeting/:meetingId`
* `GET /api/tasks/:id`
* `PATCH /api/tasks/:id`
* `DELETE /api/tasks/:id`

### Summaries

* `POST /api/summaries`
* `GET /api/summaries/meeting/:meetingId`
* `GET /api/summaries/:id`
* `PATCH /api/summaries/:id`
* `DELETE /api/summaries/:id`

### Transcriptions

* `POST /api/transcriptions`
* `GET /api/transcriptions/recording/:recordingId`
* `GET /api/transcriptions/:id`
* `PATCH /api/transcriptions/:id`
* `DELETE /api/transcriptions/:id`

### AI Operations

* `POST /api/transcribe`
* `POST /api/summarize`
* `POST /api/meeting-text/process`

---

## 9. Backend Validation and Quality

The NestJS backend is responsible for:

* DTO-based request validation
* required field validation
* format validation
* consistent HTTP responses
* orchestration of database and AI-related operations

Typical status codes include:

* `200 OK`
* `201 Created`
* `400 Bad Request`
* `401 Unauthorized`
* `404 Not Found`
* `500 Internal Server Error`

---

## 10. Frontend

### Main Pages

The frontend includes several user-facing views, including:

* Home page
* Login page
* Signup page
* Dashboard
* Meetings list page
* New meeting page
* New meeting text page
* Meeting detail page

### UI Principles

* responsive design
* reusable components
* form validation
* loading states
* readable error messages
* clear user experience

---

## 11. NestJS Backend Role

NestJS acts as an **API Gateway** rather than the primary authentication layer.

Its role is to:

* centralize business operations
* validate requests
* expose a consistent REST API
* orchestrate calls to Supabase
* execute text-side AI logic with Gemini

It does **not** replace:

* Supabase Auth
* Supabase Storage
* Supabase Edge Functions

---

## 12. Security

### Authentication

* managed through Supabase Auth
* the frontend retrieves the authenticated user token
* the token is forwarded to the backend in the `Authorization` header

### Database Access

* handled through Supabase
* user-level data isolation is enforced through Supabase policies

### Backend Layer

* validates request structure
* checks authentication context
* acts as a controlled orchestration layer between client and persistence

---

## 13. Installation

### Backend

```bash
cd backend
npm install
```

Create `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```

Run:

```bash
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
```

Create `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001/api
```

Run:

```bash
npm run dev
```

---

## 14. Database

### Migrations

```bash
npm run db:migrate
```

### Seed

```bash
npm run db:seed
```

### Reset

```bash
npm run db:reset
```

---

## 15. Business Flow

### Case 1: Audio Meeting

1. create a meeting
2. upload an audio file
3. create a `recording`
4. transcribe the audio
5. generate a summary
6. persist transcript, summary, and tasks

### Case 2: Text Meeting

1. create a meeting
2. add meeting text
3. process the text with Gemini
4. generate structured intelligence
5. persist results to `ai_summaries` and `tasks`

---

## 16. AI Added Value

The AI layer is a core functional part of the product. It enables:

* faster post-meeting review
* automatic extraction of action items
* clearer visibility of decisions
* generation of structured follow-up tasks
* improved readability of meeting outcomes

---

## 17. Error Handling

The project handles:

* validation errors
* missing or invalid tokens
* non-existent meetings
* missing files
* transcription failures
* AI generation failures
* persistence errors

On the frontend, users receive:

* readable error messages
* loading feedback
* consistent interaction states

---

## 18. Technical Highlights

This project demonstrates:

* full-stack application design
* modular architecture
* structured REST API design
* relational database integration
* Supabase integration
* practical LLM integration
* backend validation
* a usable modern UI

---

## 19. Current Limitations and Future Improvements

Potential future improvements include:

* advanced multi-user collaboration
* speaker diarization
* semantic meeting search
* PDF / DOCX export
* notifications
* meeting analytics
* summary version history

---

## 20. Conclusion

MeetMind is a meeting intelligence platform built with a modern, modular, and practical architecture. It combines:

* **React** for the user interface
* **NestJS** for the REST API layer
* **Supabase** for persistence, authentication, and storage
* **OpenAI** and **Gemini** for AI-powered meeting processing

The platform supports both audio and text meeting inputs while preserving a unified structured output model across the system.
