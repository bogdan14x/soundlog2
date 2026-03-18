# SoundLog2

A music logging and discovery application built with Nuxt and Supabase.

## Supabase Authentication Setup

SoundLog2 uses Supabase for user authentication and data management.

### Environment Configuration

Copy the `.env.example` file to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Then edit `.env` with your actual Supabase and Spotify credentials:

```bash
# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Spotify OAuth Configuration (optional)
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
```

### Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Enable Authentication**:
   - Go to Authentication > Providers
   - Enable Email/Password authentication
   - Enable Spotify OAuth (if using Spotify integration)
3. **Create Database Tables**:
   - The app expects a `profiles` table with the following structure:
     ```sql
     CREATE TABLE profiles (
       id UUID PRIMARY KEY REFERENCES auth.users(id),
       username TEXT UNIQUE,
       full_name TEXT,
       avatar_url TEXT,
       website TEXT,
       created_at TIMESTAMPTZ DEFAULT NOW(),
       updated_at TIMESTAMPTZ DEFAULT NOW()
     );
     ```
4. **Set up Row Level Security (RLS)**:
   - Enable RLS on the `profiles` table
   - Create policies for authenticated users to read/write their own profile

### Development

Start the development server:

```bash
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test
npm test -- path/to/test.file

# Run type check
npm run typecheck

# Run linter
npm run lint
```

### Building for Production

```bash
npm run build
npm run preview
```

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
