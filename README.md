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

```bash
npm install
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev
```

Otvorte [http://localhost:3000](http://localhost:3000)

**Predvolené prihlásenie:**
- Email: `admin@nextlayer.studio`
- Heslo: `admin123`

> Zmeňte heslo po prvom prihlásení v produkcii!

## Tech stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Prisma + SQLite
- NextAuth.js
- Recharts
