# Local MongoDB for Development

This project includes a Docker Compose setup to run MongoDB locally for development.

## Prerequisites

- Docker Desktop installed and running on Windows

## Start the database

```powershell
npm run db:up
```

This starts a container named `astromahrixspace-mongo` and exposes port 27017.

## View logs

```powershell
npm run db:logs
```

## Stop and remove the database container

```powershell
npm run db:down
```

## Environment variables

Copy `.env.example` to `.env` at the repo root to set optional variables for the backend:

```
MONGODB_URL= # leave empty for local mongodb://localhost/astromahrixspace, or set your Atlas URI
PAYPAL_CLIENT_ID=sb
GOOGLE_API_KEY=
```

The backend reads `MONGODB_URL` in `backend/server.js`. If not set, it defaults to `mongodb://localhost/astromahrixspace`.

## Running the app

- Start DB: `npm run db:up`
- Start backend: `npm run dev`
- Start frontend: task "Start Frontend" or `npm start --prefix frontend`

If you use MongoDB Atlas instead of Docker, set `MONGODB_URL` accordingly and skip `db:up`.
