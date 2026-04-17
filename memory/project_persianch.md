---
name: PersianCH Project
description: Persian business directory website for Switzerland — tech stack, structure, and deployment pipeline
type: project
---

Persian business directory website for Switzerland.

**Repo:** github.com/Afshin-RKh/Persianch
**Local path:** E:\Entropernerial\persianch
**Hosting:** Namecheap (static export via FTP)

**Stack:** Next.js 16 (static export), TypeScript, Tailwind CSS, Supabase (database)

**Key files:**
- `src/types/index.ts` — Business type, CATEGORIES list, SWISS_CITIES
- `src/lib/supabase.ts` — DB query helpers
- `src/app/businesses/BusinessesContent.tsx` — client-side listing page with filters
- `src/app/businesses/detail/page.tsx` — client-side business detail page (uses ?id= query param)
- `src/app/admin/page.tsx` — password-protected admin to add businesses
- `.github/workflows/deploy.yml` — GitHub Actions: build → FTP deploy to Namecheap
- `supabase-schema.sql` — SQL to run in Supabase dashboard

**Still needs:**
1. Supabase project created + env vars set in .env.local AND GitHub Secrets
2. GitHub Secrets added: FTP_SERVER, FTP_USERNAME, FTP_PASSWORD, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_ADMIN_PASSWORD
3. `supabase-schema.sql` run in Supabase SQL editor

**Why static export:** Namecheap shared hosting doesn't run Node.js servers. Static HTML+JS exported and deployed via FTP. All dynamic data (business listings) fetched client-side from Supabase.
