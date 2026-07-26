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
