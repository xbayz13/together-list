# Together List

A bucket list website for couples. Track activities, ideas, and plans you want to do together.

![Together List](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)

## Features

- **Activity Management** — Add, edit, and delete activities with status tracking
- **Status Filtering** — Filter by Ide, Dijadwalin, Done, or Batal
- **Calendar View** — See scheduled activities on a calendar grid
- **Upcoming List** — Quick view of upcoming scheduled activities
- **Progress Tracking** — Visual progress bar showing completion percentage
- **Responsive Design** — Works on desktop and mobile with tab navigation
- **Smooth Animations** — Moving clouds, tab transitions, and micro-interactions

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | App Router + Server Actions |
| Prisma 7 | ORM + PostgreSQL |
| Tailwind CSS 4 | Styling + Custom Theme |
| PostgreSQL 16 | Database |
| PM2 | Process Manager (production) |
| Nginx | Reverse Proxy (production) |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 16+

### Installation

1. Clone the repository

```bash
git clone git@github.com:xbayz13/together-list.git
cd together-list
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```
DATABASE_URL="postgresql://user:password@localhost:5432/together_list?schema=public"
```

4. Run Prisma migration

```bash
npx prisma migrate dev
```

5. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
together-list/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── generated/prisma/      # Generated Prisma client
├── src/app/
│   ├── actions/
│   │   └── activities.ts      # Server Actions (CRUD)
│   ├── components/
│   │   ├── CalendarPanel.tsx   # Calendar grid + navigation
│   │   ├── ListPanel.tsx       # Activity list + filters
│   │   ├── ActivityCard.tsx    # Individual activity card
│   │   ├── ActivityModal.tsx   # Add/edit/delete modal
│   │   ├── FilterTabs.tsx      # Status filter tabs
│   │   ├── MovingClouds.tsx    # Background animation
│   │   ├── MobileTabs.tsx      # Mobile navigation
│   │   ├── FloatingActionButton.tsx
│   │   ├── UpcomingList.tsx    # Upcoming activities
│   │   └── Toast.tsx           # Error notifications
│   ├── lib/
│   │   └── utils.ts            # Helper functions
│   ├── layout.tsx              # Root layout + SEO
│   ├── page.tsx                # Main page
│   └── globals.css             # Tailwind + animations
├── public/
│   └── favicon.svg
├── ecosystem.config.cjs        # PM2 config
└── package.json
```

## Database Schema

```prisma
enum Status {
  IDE
  DIJADKANIN
  DONE
  BATAL
}

model Activity {
  id          Int       @id @default(autoincrement())
  title       String    @db.VarChar(100)
  description String?   @db.VarChar(500)
  date        DateTime?
  status      Status    @default(IDE)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

## Production Deployment

### Build

```bash
npm run build
```

### PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

### Nginx

Add to your Nginx config:

```nginx
server {
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## License

MIT
