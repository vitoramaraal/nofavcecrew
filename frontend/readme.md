# NoFvce Crew frontend

Frontend React + Vite do app NoFvce Crew.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

No Windows, se o PowerShell bloquear `npm.ps1`, use `npm.cmd run dev`.

## Env

Copie `.env.example` para `.env` e preencha:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Member login uses an individual secret code generated on approval and stored in
Supabase, not a shared env code.

Admin login uses Supabase Auth at `/admin`. Create the admin user in
Authentication, then add its UUID to `public.admin_users`.
