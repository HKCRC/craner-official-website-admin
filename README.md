# Craner CMS Admin

A minimal Next.js CMS with JWT auth, Tiptap rich text, Prisma + MongoDB, and a
WordPress-style media library.

## Stack

- Next.js 16 (App Router)
- Tailwind CSS
- Prisma 6 + MongoDB
- JWT auth (cookie-based) via `jose`
- [Tiptap](https://tiptap.dev/) via `@tiptap/react` (StarterKit + Image + Link)

## Requirements

- Node.js 20+
- Docker (for local MongoDB with a replica set — required by Prisma for Mongo)

## Setup

1. Start a local MongoDB replica set (first time only):

   ```bash
   docker run -d --name craner-mongo -p 27017:27017 mongo:7 \
     --replSet rs0 --bind_ip_all

   # wait a couple of seconds, then initialize the replica set
   docker exec craner-mongo mongosh --quiet --eval \
     "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})"
   ```

   Afterwards you can just `docker start craner-mongo` to bring it back up.

2. Install dependencies and sync the schema:

   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   ```

3. Configure `.env`:

   ```dotenv
   DATABASE_URL="mongodb://localhost:27017/craner_cms?replicaSet=rs0&directConnection=true"
   JWT_SECRET="change-me"
   SUPERADMIN_ACCESS_KEY="change-me-too"
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

## Bootstrapping the superadmin

Only one superadmin can exist. Visit `/admin/register` and supply the
`SUPERADMIN_ACCESS_KEY` from `.env` to create it. After that, the superadmin can
invite sub users from `/admin/users`.

## Features

- `/admin/login` — JWT-based cookie login for any user
- `/admin/register` — superadmin bootstrap, gated by `SUPERADMIN_ACCESS_KEY`
- `/admin/users` — superadmin-only, create/delete sub-admins
- `/admin/categories` — create, rename, delete categories
- `/admin/media` — upload images (max 5 MB, images only) to
  `public/uploads`, reusable across posts
- `/admin/posts` — list posts; `/admin/posts/new` and `/admin/posts/:id/edit`
  use a Tiptap rich text editor (Bold/Italic/Headings/Lists/Quote/Code/Link/
  Image from media library), require at least one category, and can optionally
  pick a cover image from the media library. Content is stored as HTML.

Middleware at `middleware.ts` protects every `/admin/*` route (except
`/admin/login` and `/admin/register`) by verifying the `cms_token` cookie.

## Notes

- Uploaded files live in `public/uploads/` (ignored by git if you add the path
  to `.gitignore`). For production, swap the upload handler in
  `src/app/api/media/upload/route.ts` for S3/R2 or similar.
- The Tiptap editor is loaded with `next/dynamic({ ssr: false })` to keep
  browser-only APIs out of SSR, and the editor component itself uses
  `immediatelyRender: false` to be SSR-safe.
