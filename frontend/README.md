# Social Media Frontend

A React + Vite single-page app for the Spring Boot **Social Media API Backend** in the
parent directory.

## Requirements

- Node 18+ and npm
- The backend running on `localhost:9092` (see the parent project's README)

## Setup

```bash
cd frontend
npm install
npm run dev
```

The dev server starts on `localhost:5173`. Vite proxies `/api` and `/auth` requests to
the backend, so no CORS setup is needed during development.

## Configuration

Environment variables (optional, put them in `frontend/.env`):

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_API_TARGET` | Backend origin the Vite dev proxy forwards to | `localhost:9092` |
| `VITE_API_BASE_URL` | Absolute API base used by the app instead of the proxy (set this for production builds) | empty (same origin) |

## How it talks to the backend

- **Auth** — `POST /auth/users/register`, `POST /auth/users/login` (returns `{ "JWT": ... }`),
  `PUT /auth/users/passwordreset`. The JWT is stored in `localStorage` and sent as
  `Authorization: Bearer <token>` on every request. The token's `sub` claim (the user's
  email) identifies the current user; there is no "me" endpoint on the backend.
- **Posts** — `GET /api/posts` (public feed), `POST /api/posts`, `PUT /api/posts/{id}`,
  `DELETE /api/posts/{id}`, `DELETE /api/posts` (delete all of your posts).
- **Comments** — `GET|POST /api/posts/{id}/comments`,
  `PUT|DELETE /api/posts/{id}/comments/{commentId}`.
- **Reactions** — `POST /api/posts/{id}/reactions/{like|laugh|angry|sad}`.

### Backend quirks the UI works around

- `GET /api/posts/{id}` only returns a post you own, so detail pages fall back to the
  public feed list (`src/lib/loadPost.js`).
- `PUT /api/posts/{id}` is rejected with 409 unless the **title** changes; the edit form
  warns about this.
- Comment editing has no author check on the backend; the UI still only shows an Edit
  button on your own comments.
- Deleting a comment only works when the parent post is yours.
- API responses never include user IDs, so ownership is decided by matching email.

## Project layout

```
src/
  api/           fetch client, auth + posts endpoint wrappers
  context/       AuthContext (token storage, login/logout, auto-logout on expiry)
  components/    Navbar, PostCard, ReactionBar, CommentSection, ProtectedRoute
  pages/         Feed, PostDetail, CreatePost, EditPost, Login, Register, PasswordReset, Profile
  lib/           date formatting, reaction helpers, loadPost fallback
```

## Production build

```bash
npm run build      # outputs to dist/
npm run preview
```

For a real deployment, set `VITE_API_BASE_URL` to the deployed backend origin and make
sure the backend's CORS config allows the frontend origin.
