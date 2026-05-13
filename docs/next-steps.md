# NoFvce Crew - Next Steps

## Current Status

MVP foundation completed:

- React + Vite + Tailwind CSS
- Minimal public landing
- Candidate application without account
- Application masks, validations and anonymous-face confirmation
- Supabase applications and members
- Admin approval/rejection flow protected by Supabase Auth
- Admin allowlist through `public.admin_users`
- Admin panel roles: founder, admin and moderator
- Access flags documented in `docs/access-control.md`
- Automatic member creation
- Individual secret member code
- WhatsApp code handoff from admin
- Initial roles: founder, admin, moderator, member
- Private members area
- Member session validation against Supabase on protected routes
- Editable member profile with bio, setup, specs, mods and gallery
- Garage, events, drops, profile and chat routes
- Persistent internal chat table
- QR verification route for member cards
- Member card PNG export
- Private profile page scoped to current member
- Digital member card
- PWA manifest and service worker
- Setup, schema and cleanup docs

## High Priority

- Add realtime updates to internal chat.
- Harden QR validation for event check-in.
- Add event tables, RSVP and QR check-in.
- Surface advanced profile data in garage cards and future feed/profile views.
- Move admin write actions to Supabase Edge Functions before larger production scale.
- Add audit logs for admin approval, rejection, role changes and deletion.

## Medium Priority

- Feed privado da crew with photos, captions, likes and comments.
- Push notifications for approval, events, drops and posts.
- Dynamic drops catalog with stock and sizes.
- Public NoFvce page with manifesto, media and apply.

## Future

- Free deployment first, then `nofvcecrew.com` when the domain is available.
- Capacitor or React Native wrapper if store publishing becomes necessary.
- Regions/chapters.
- Admin scanner using camera for QR check-in.
- Official media gallery.
