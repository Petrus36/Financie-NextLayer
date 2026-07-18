# NextLayer Studio — Financie

Finančný prehľad pre firmu NextLayer Studio. Spravujte klientov, zakázky, výdavky, príjmy a štatistiky na jednom mieste.

## Funkcie

- **Klienti** — pridávanie a správa klientov
- **Zakázky** — projekty priradené ku klientom s cenou a výdavkami
- **Odovzdanie projektu** — tlačidlo „Odovzdať" so súhrnom zisku a voliteľnou mesačnou údržbou
- **Výdavky firmy** — jednorazové alebo mesačné opakujúce sa náklady
- **Príjmy firmy** — ďalšie príjmy mimo projektov
- **Štatistiky** — prehľad s filtrom podľa mesiaca alebo roka, grafy
- **Prihlásenie** — zabezpečený prístup cez NextAuth

## Spustenie

1. Skopírujte Neon connection string do `.env`:
   - `DATABASE_URL` — pooled (pre aplikáciu)
   - `DATABASE_URL_UNPOOLED` — direct (pre migrácie)
   - `AUTH_SECRET` — náhodný reťazec pre NextAuth

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Otvorte [http://localhost:3000](http://localhost:3000)

**Predvolené prihlásenie:**
- Email: `admin@nextlayer.studio`
- Heslo: `admin123`

> Zmeňte heslo po prvom prihlásení v produkcii!

## Nasadenie na Vercel

V **Project → Settings → Environment Variables** nastavte:

| Premenná | Príklad |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `DATABASE_URL_UNPOOLED` | Neon direct connection string |
| `AUTH_SECRET` | rovnaký náhodný reťazec ako lokálne (`openssl rand -base64 32`) |
| `AUTH_URL` | `https://financie-next-layer.vercel.app` |

Po prvom deployi spustite seed proti produkčnej databáze (aspoň raz), aby existoval admin účet:

```bash
DATABASE_URL="..." npm run db:seed
```

Ak sa stránka stále neotvorí, vymažte cookies pre doménu `vercel.app` v prehliadači a skúste znova.

## Tech stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Prisma + Neon PostgreSQL
- NextAuth.js
- Recharts
