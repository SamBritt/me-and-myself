# Me & Myself

A private journaling app: rich-text entries, daily mood tracking, selectable
color themes, and an AI reflection chat that's designed to gently push back
rather than just agree with everything.

## Stack

- **Frontend**: Vue 3 (Composition API, `<script setup>`), Vite, TypeScript, Tailwind CSS, Pinia, urql (GraphQL client), Tiptap (rich text editor), Chart.js
- **Backend**: Node.js, TypeScript, Express, GraphQL Yoga, Prisma ORM (Postgres via Supabase), JWT auth
- **AI**: Anthropic Claude API, called server-side only

## Getting started

### Backend

```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL (Supabase) and ANTHROPIC_API_KEY
npm install
npm run prisma:migrate -- --name init
npm run dev             # http://localhost:4000/graphql
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

## Project structure

```
backend/    Express + GraphQL Yoga API, Prisma schema/migrations
frontend/   Vue 3 app
```

See `backend/src/graphql/schema.graphql` for the GraphQL contract and
`backend/prisma/schema.prisma` for the data model.
