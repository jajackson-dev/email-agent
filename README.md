# OpsThreads

B2B SaaS web app foundation for **app.opsthreads.com** — React + Vite, with
Supabase (auth / database / storage), the Anthropic SDK, and Stripe.js.

## Stack

- **React 18** + **Vite 5**
- **React Router 6** for routing
- **Tailwind CSS 3** for styling (brand colors: primary `#3B6D11`, background `#FAFAF7`)
- **@supabase/supabase-js** for auth, database, and storage
- **@anthropic-ai/sdk** for Claude API calls
- **@stripe/stripe-js** for payments

## Project structure

```
src/
  pages/        Login, Signup, Onboarding, OwnerDashboard,
                ManagerDashboard, EmployeeChat, NotFound
  components/   Sidebar, ProtectedRoute, RoleGuard
  lib/          supabase.js, stripe.js
  App.jsx       route tree
  main.jsx      app entry
schema.sql      database schema + Row Level Security
.env.example    required environment variables
```

## Routes

| Path          | Page              | Access                         |
| ------------- | ----------------- | ------------------------------ |
| `/`           | → `/login`        | redirect                       |
| `/login`      | Login             | public                         |
| `/signup`     | Signup            | public                         |
| `/onboarding` | Onboarding        | owner only                     |
| `/dashboard`  | OwnerDashboard    | owner only                     |
| `/manager`    | ManagerDashboard  | manager / supervisor (+ owner) |
| `/chat`       | EmployeeChat      | any authenticated role         |
| `*`           | NotFound          | —                              |

After login the user is routed by role: `owner → /dashboard`,
`manager`/`supervisor → /manager`, `employee → /chat`.

---

## 1. Create a Supabase project (get the URL and anon key)

1. Go to <https://supabase.com>, sign in, and click **New project**.
2. Pick an organization, give the project a name (e.g. `opsthreads`), set a
   strong database password, choose a region close to your users, and create it.
3. Wait ~2 minutes for provisioning.
4. In the project, open **Settings → API**. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys → `anon` `public`** → `VITE_SUPABASE_ANON_KEY`
5. Copy `.env.example` to `.env` and fill in the values:

   ```bash
   cp .env.example .env
   ```

   ```dotenv
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   VITE_ANTHROPIC_API_KEY=        # see security note below
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

## 2. Run the schema

1. In Supabase, open **SQL Editor → New query**.
2. Paste the entire contents of `schema.sql` and click **Run**.
3. This creates all tables and enables Row Level Security so users can only
   read/write rows in workspaces they belong to.

   (You can verify under **Table Editor** — each table should show an
   "RLS enabled" badge.)

## 3. Start the dev server

```bash
npm install
npm run dev
```

Vite serves the app at <http://localhost:5173>. Open `/login`.

---

## ⚠️ Security note: the Anthropic API key

Any variable prefixed with `VITE_` is **bundled into the browser** and is
publicly visible. Do **not** ship a real `VITE_ANTHROPIC_API_KEY` to production —
it would let anyone use (and bill) your Anthropic account.

For real Claude calls, proxy them through a backend so the key stays server-side.
The natural fit here is a **Supabase Edge Function**: the browser calls the
function, the function holds the secret `ANTHROPIC_API_KEY` and calls the
Anthropic API. The `@anthropic-ai/sdk` dependency is installed and ready to use
from that server context.
