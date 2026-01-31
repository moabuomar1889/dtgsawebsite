# DTGSA Website Project Structure

Last updated: 2026-01-26

## Directory Tree

```
dtgsa-website/
├── app/
│   ├── admin/
│   │   ├── (dashboard)/
│   │   │   ├── clients/
│   │   │   │   └── page.tsx
│   │   │   ├── experience/
│   │   │   │   └── page.tsx
│   │   │   ├── messages/
│   │   │   │   └── page.tsx
│   │   │   ├── news/
│   │   │   │   └── page.tsx
│   │   │   ├── projects/
│   │   │   │   └── page.tsx
│   │   │   ├── services/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── login/
│   │       └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── HomePageClient.tsx
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── admin/
│   │   ├── AdminLayout.tsx
│   │   └── ImageUpload.tsx
│   ├── layout/
│   │   ├── FullpageWrapper.tsx
│   │   ├── LeftSidebar.tsx
│   │   ├── MobileMenu.tsx
│   │   ├── RightScrollIndicator.tsx
│   │   └── TopNav.tsx
│   ├── providers/
│   │   └── SmoothScrollProvider.tsx
│   ├── sections/
│   │   ├── About.tsx
│   │   ├── Clients.tsx
│   │   ├── Contact.tsx
│   │   ├── Experience.tsx
│   │   ├── Hero.tsx
│   │   ├── News.tsx
│   │   ├── Projects.tsx
│   │   └── Workforce.tsx
│   └── ui/
│       └── GilberCard.tsx
│
├── hooks/
│   ├── useScrollProgress.ts
│   └── useScrollSpy.ts
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── actions.ts
│   ├── data-fetching.ts
│   ├── data.ts
│   ├── fallback-data.ts
│   ├── motion.ts
│   ├── storage.ts
│   ├── theme.tsx
│   └── theme_backup.ts
│
├── public/
│   └── placeholders/
│
├── supabase/
│   └── schema.sql
│
├── .env.local
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## File Descriptions

### `/app` - Next.js App Router Pages

| File | Description |
|------|-------------|
| `page.tsx` | Homepage (server component) |
| `layout.tsx` | Root layout with fonts and providers |
| `globals.css` | Global styles including border animations |
| `HomePageClient.tsx` | Client-side homepage with fullpage scroll |

### `/app/admin` - Admin Dashboard

| File | Description |
|------|-------------|
| `login/page.tsx` | Admin login page |
| `(dashboard)/page.tsx` | Admin dashboard home |
| `(dashboard)/layout.tsx` | Dashboard layout with sidebar |
| `(dashboard)/clients/page.tsx` | Manage clients |
| `(dashboard)/projects/page.tsx` | Manage projects |
| `(dashboard)/news/page.tsx` | Manage news articles |
| `(dashboard)/services/page.tsx` | Manage services |
| `(dashboard)/experience/page.tsx` | Manage experience/timeline |
| `(dashboard)/messages/page.tsx` | View contact messages |
| `(dashboard)/settings/page.tsx` | Site settings (accent color, etc.) |

### `/components` - React Components

#### `/components/sections` - Homepage Sections
| File | Description |
|------|-------------|
| `Hero.tsx` | Landing hero section |
| `About.tsx` | About us with stats |
| `Experience.tsx` | Years of experience with skills |
| `Workforce.tsx` | Services/capabilities grid |
| `Projects.tsx` | Featured projects |
| `Clients.tsx` | Client logos grid |
| `News.tsx` | News articles |
| `Contact.tsx` | Contact form |

#### `/components/layout` - Layout Components
| File | Description |
|------|-------------|
| `FullpageWrapper.tsx` | Fullpage scroll container |
| `LeftSidebar.tsx` | Fixed left social links |
| `TopNav.tsx` | Top navigation bar |
| `MobileMenu.tsx` | Mobile hamburger menu |
| `RightScrollIndicator.tsx` | Scroll progress indicator |

#### `/components/ui` - UI Components
| File | Description |
|------|-------------|
| `GilberCard.tsx` | Card with animated hover border |

### `/lib` - Utilities and Data

| File | Description |
|------|-------------|
| `data.ts` | Static data and `getYearsOfExperience()` |
| `actions.ts` | Server actions for CRUD operations |
| `data-fetching.ts` | Data fetching utilities |
| `motion.ts` | Framer Motion animation variants |
| `storage.ts` | Supabase storage utilities |
| `theme.tsx` | Theme context provider |

### `/lib/supabase` - Database

| File | Description |
|------|-------------|
| `client.ts` | Supabase browser client |
| `server.ts` | Supabase server client |
| `types.ts` | TypeScript types for database |

### `/hooks` - Custom React Hooks

| File | Description |
|------|-------------|
| `useScrollProgress.ts` | Track scroll position |
| `useScrollSpy.ts` | Detect active section |
