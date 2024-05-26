# supa blog

A blog app using supabase as backend.

## Steps for deployment

1. Register a supabase account
2. Create database using sql provided
3. Create a public bucket named `uploads` and create a policy to allow authenticated user to select/insert/update/delete for that bucket
4. Get project ref and anon key and put them in supabase config in `app.config.ts`
5. Deploy this project on deno or vercel

## Development

### Setup

Make sure to install the dependencies:

```bash
# pnpm
pnpm install
```

### Development Server

Start the development server on `http://localhost:3000`:

```bash
# pnpm
pnpm run dev
```

### Production

Build the application for production:

```bash
# pnpm
pnpm run build
```

Locally preview production build:

```bash
# pnpm
pnpm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
