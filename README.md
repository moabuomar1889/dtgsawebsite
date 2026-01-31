# DURRAT Construction Website

A Gilber-style fullpage scroll website with Supabase CMS backend.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Framer Motion
- **Backend**: Supabase (Auth, Database, Storage)
- **Schema**: `dtgsa-website` (all tables in this schema)

## Setup

### 1. Clone and Install

```bash
cd dtgsa-website
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (~2 minutes)

### 3. Configure Environment

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find these values in Supabase Dashboard → Settings → API.

### 4. Run Database Schema

Copy the contents of `supabase/schema.sql` and run it in Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Paste the entire schema.sql content
3. Click "Run"

This creates:
- All tables with proper structure
- Row Level Security (RLS) policies
- Seed data for initial content

### 5. Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Create a new bucket called `public-assets`
3. Make it public (for reading)

### 6. Create Admin User

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Enter email and password
4. This user can now log into `/admin/login`

### 7. Run Development Server

```bash
npm run dev
```

Visit:
- **Public site**: http://localhost:3000
- **Admin login**: http://localhost:3000/admin/login

## Admin CMS

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard with stats |
| `/admin/settings` | Site settings, accent color |
| `/admin/clients` | Manage clients |
| `/admin/projects` | Manage projects |
| `/admin/news` | Manage news articles |
| `/admin/experience` | Manage experience entries |
| `/admin/services` | Manage services |
| `/admin/messages` | Read contact messages |

## Security

- **RLS Enabled**: All tables have Row Level Security
- **Public Read**: Published content readable by anyone
- **Authenticated Write**: Only logged-in users can modify data
- **No Service Role**: CMS uses user session for all operations

## Database Schema

All tables are in the `dtgsa-website` schema:

- `settings` - Site settings (single row)
- `clients` - Client logos and info
- `projects` - Project portfolio
- `news` - News articles
- `experience` - Work experience
- `services` - Services offered
- `contact_messages` - Form submissions

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Fallback Data

When the database is empty or not configured, the site displays seeded placeholder data. This ensures the site always looks complete.
