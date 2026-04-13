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
