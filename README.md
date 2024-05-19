# supa blog

A blog app using supabase as backend.

## Steps for deployment

1. Register a supabase account
2. Create database using sql provided
3. Create a user usiing supabase Authentication panel
4. Modify supabase config in `app.config.ts`
5. Deploy to vercel

## Development

### Make sure to install the dependencies:

```bash
# pnpm
pnpm install
```

### Start the development server on `http://localhost:3000`:

```bash
# pnpm
pnpm dev
```

### Production

Build the application for production:

```bash
# pnpm
pnpm build
```

Locally preview production build:

```bash
# pnpm
pnpm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
