# ComicVerse

ComicVerse is a full-stack Vietnamese comic-reading platform with reader, creator, and administrator workflows.

## Stack

- Client: React 19, Vite, TypeScript, TanStack Query, Zustand, React Hook Form, and Zod.
- Backend: Express 5, TypeScript, MongoDB/Mongoose, Cloudflare R2, Upstash Redis, and VNPay.
- Runtime: Node.js 24.x for the backend, client, and ingestion bot.

## Local development

### Backend

```powershell
cd Backend
Copy-Item .env.example .env
npm ci
npm run dev
```

### Client

```powershell
cd Client
npm ci
npm run dev
```

Set `VITE_API_URL` to the backend API URL when the two apps run on different origins. Do not expose backend credentials through `VITE_*` variables.

## Quality checks

```powershell
cd Backend; npm run build; npm test
cd Client; npm run lint; npm test; npm run build
cd Backend\bot; npm run build
```

The GitHub Actions workflow runs independent quality gates for Backend, Client, and Bot on pull requests and pushes to `main`.

## Production

Deploy `Client` and `Backend` as separate Vercel projects. Follow the controlled-release checklist in [docs/production-readiness.md](docs/production-readiness.md), including `/api/health`, `/api/ready`, browser authentication, chapter upload, reading, and VNPay-return smoke checks.

Chapter uploads are intentionally bounded to three files of at most 8 MB each per request. The client should batch larger chapters.

## Repository layout

```text
Backend/
  src/          Express API, models, routes, middleware, and services
  tests/        Node test-runner regression tests
  bot/          Comic ingestion bot
Client/
  src/          React application, components, routes, stores, and services
docs/           Production runbooks and implementation records
```

## License

MIT. See [LICENSE](LICENSE).
