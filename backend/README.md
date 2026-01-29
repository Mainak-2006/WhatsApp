# WhatsApp Clone Backend

Real-time messaging server built with Node.js, Express, Socket.IO, and Drizzle ORM.

## Setup

1. Install dependencies: `npm install`
2. Set up `.env` file with required environment variables
3. Run migrations: `npm run db:push`
4. Start dev server: `npm run dev`

## Environment Variables

- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `PORT` - Server port (default: 3000)
