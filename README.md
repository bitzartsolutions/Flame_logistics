# Flame Logistics Project Structure

This workspace is organized into two main apps:

- `frontend/`: static pages and assets
- `backend/`: API/server code

## Frontend page convention

Store each page in both variants:

- `frontend/pages/desktop/<page-name>.html`
- `frontend/pages/mobile/<page-name>.html`

Example:

- `frontend/pages/desktop/home.html`
- `frontend/pages/mobile/home.html`

## Backend starter

A minimal Node.js + Express server is included.

Run:

```bash
cd backend
npm install
npm run dev
```

## Persistent admin content with Supabase

To make gallery, blog, and careers data survive refreshes and deployments, configure these variables in backend/.env (and in your Vercel project settings):

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

The backend will use Supabase as the primary store for admin-managed content. If Supabase is unavailable, it falls back to the local JSON storage files in backend/data.
