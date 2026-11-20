# Planfin

Personal financial planning app.

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Elixir + Phoenix + Absinthe (GraphQL) |
| Mobile | React Native + Expo |
| Auth | phx.gen.auth + JWT + Refresh Tokens |
| GraphQL Client | Apollo Client + @absinthe/socket-apollo-link |

## Structure

```
planfin/
├── backend/   # Elixir/Phoenix API
└── mobile/    # Expo React Native app
```

## Getting Started

### Backend

```bash
cd backend
mix deps.get
mix ecto.setup
mix phx.server
```

GraphQL playground available at `http://localhost:4000/api/graphiql`

### Mobile

```bash
cd mobile
npm install
npx expo start
```

## Environment Variables

### Backend (`backend/.env`)

```
DATABASE_URL=postgresql://postgres:postgres@localhost/planfin_dev
SECRET_KEY_BASE=<generate with: mix phx.gen.secret>
```

### Mobile (`mobile/.env`)

```
EXPO_PUBLIC_API_URL=http://localhost:4000
EXPO_PUBLIC_WS_URL=ws://localhost:4000
```

## Production

| Piece | Where |
|-------|-------|
| Backend | Fly.io app `planfin-api` (`api.planfin.app.br`) |
| Frontend | Vercel, Expo Web (`planfin.app.br`) |
| Database | Postgres on Supabase |
| Backups | private repo `Pedro-S-Soares/planfin-backups`, daily at 06:00 UTC, encrypted with age |

### Deploy

Nothing deploys on merge. Deploy from an exact `origin/main` checkout with:

```bash
scripts/deploy.sh               # backup, then backend
scripts/deploy.sh --frontend    # backup, then backend, then frontend
scripts/deploy.sh --backup-only # backup only, publishes nothing
```

`fly deploy` runs the migrations (`release_command`), so the script first triggers the
backup workflow in the backups repo, waits for that exact run, and aborts the deploy if it
is not green. With `--frontend` it also runs `vercel deploy --prod` and checks that the
published bundle points to `api.planfin.app.br` and has no `localhost`.
Requires `gh`, `fly` and (for the frontend) `vercel` logged in, plus
`mobile/.vercel/project.json` (copy it from the main checkout in a new worktree).

### Restore

Follow the README of the backups repo: decrypt the `.age` file with the private key kept
outside any repo, then `pg_restore --no-owner --no-acl`. Test a restore in a throwaway local
database before touching production. Never commit a dump or a key here: this repo is public.
