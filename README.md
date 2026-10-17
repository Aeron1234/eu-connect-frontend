This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Backend API configuration

Set the full backend API base in `.env.local` for local development and in the hosting environment for production:

```dotenv
API_BASE_URL=http://localhost:7000/api/v1
# Production example: API_BASE_URL=https://your-backend.example/api/v1
```

`lib/api-base-url.mjs` resolves the base for all server actions, backend proxies and PDF data requests. Callers append resource paths such as `/auth/login`, without adding another `/api`. Previous settings ending in `/eu-connect` or `/eu-connect/api` are accepted during migration and resolve to `/api/v1`.

Deploy/restart the backend before the frontend. Next.js rewrites both `/api/v1/:path*` and the legacy `/eu-connect/api/:path*` to the canonical backend. The backend keeps both prefixes available during rollout, sharing cache entries, invalidation and request limits. Next.js-owned `/api/reports/*`, `/api/users` and `/api/socket-ticket` URLs, page routes and Socket.IO remain unchanged. No database migration is required.
