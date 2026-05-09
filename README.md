# PESA Planner Web

Minimal HTML prototype based on `PESA_Complete_Planner_Final_Yellow.pdf`.

## Run locally

1. Install dependencies:
   `npm install`
2. Start the Node dev server (with hot reload):
   `npm run dev`
3. Open `http://127.0.0.1:8081`.

If you want a production build:

1. `npm run build`
2. `npm run preview`

## Next steps

1. Recreate all PDF sections as HTML form blocks.
2. Replace local storage with Supabase persistence.
3. Deploy to GitHub Pages (or Vercel).

## Supabase migration (Step 1: DB setup, no auth)

This app currently persists multiple `localStorage` objects. To keep migration simple,
we store a single JSON document per client in Supabase.

1. Create a free Supabase project at https://supabase.com.
2. Open SQL Editor and run [`supabase/schema.sql`](./supabase/schema.sql).
3. In `planner_clients`, create one row manually with:
   - `client_id`: any stable identifier (for example `antonis-main-browser`)
   - `state`: `{}`
4. Go to `Project Settings -> API` and copy:
   - `Project URL`
   - `anon public key`
5. Create a local `.env` file from `.env.example` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

Important: this no-auth setup is intentionally permissive for now. We will lock it down
when auth is added.

## Deploy to GitHub Pages

This repo includes [deploy-pages.yml](./.github/workflows/deploy-pages.yml).

1. In GitHub repo settings, set `Pages` source to `GitHub Actions`.
2. Add these repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Push to `main` to trigger deployment.
