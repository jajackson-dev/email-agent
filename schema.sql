-- ============================================================================
-- OpsThreads database schema
-- Run this in the Supabase SQL editor (Database → SQL Editor → New query).
-- It is idempotent enough to re-run during development, but review before
-- running against data you care about.
-- ============================================================================

-- gen_random_uuid() lives in pgcrypto; Supabase enables it by default, but we
-- make sure it's present.
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

create table if not exists public.workspaces (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  owner_id    uuid not null references auth.users (id) on delete cascade,
  industry    text,
  team_size   text,
  plan        text not null default 'free',
  created_at  timestamptz not null default now()
);

create table if not exists public.workspace_members (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  role          text not null
                  check (role in ('owner', 'manager', 'supervisor', 'employee')),
  joined_at     timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table if not exists public.documents (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces (id) on delete cascade,
  name          text not null,
  file_path     text,
  status        text not null default 'processing'
                  check (status in ('processing', 'ready')),
  uploaded_at   timestamptz not null default now()
);

create table if not exists public.conversations (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  created_at    timestamptz not null default now()
);

create table if not exists public.messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations (id) on delete cascade,
  role             text not null check (role in ('user', 'assistant')),
  content          text not null,
  created_at       timestamptz not null default now()
);

create table if not exists public.approvals (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces (id) on delete cascade,
  requested_by  uuid not null references auth.users (id) on delete cascade,
  type          text not null,
  detail        text,
  status        text not null default 'pending'
                  check (status in ('pending', 'approved', 'denied')),
  created_at    timestamptz not null default now()
);

-- Helpful indexes for the foreign keys we filter on most.
create index if not exists idx_workspace_members_user on public.workspace_members (user_id);
create index if not exists idx_workspace_members_ws   on public.workspace_members (workspace_id);
create index if not exists idx_documents_ws           on public.documents (workspace_id);
create index if not exists idx_conversations_ws       on public.conversations (workspace_id);
create index if not exists idx_messages_conversation  on public.messages (conversation_id);
create index if not exists idx_approvals_ws           on public.approvals (workspace_id);

-- ----------------------------------------------------------------------------
-- Helper: the set of workspace ids the current user belongs to.
--
-- This is SECURITY DEFINER so it bypasses RLS on workspace_members. That is
-- what lets us reference workspace_members from inside the workspace_members
-- policy itself without causing infinite recursion.
-- ----------------------------------------------------------------------------

create or replace function public.user_workspace_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select workspace_id
  from public.workspace_members
  where user_id = auth.uid()
$$;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- Every table is locked down so a user can only touch rows belonging to a
-- workspace they are a member of.
-- ----------------------------------------------------------------------------

alter table public.workspaces        enable row level security;
alter table public.workspace_members enable row level security;
alter table public.documents         enable row level security;
alter table public.conversations     enable row level security;
alter table public.messages          enable row level security;
alter table public.approvals         enable row level security;

-- --- workspaces ---------------------------------------------------------------

drop policy if exists "workspaces: members can read" on public.workspaces;
create policy "workspaces: members can read"
  on public.workspaces for select
  using (id in (select public.user_workspace_ids()));

-- An authenticated user can create a workspace they own (used at onboarding).
drop policy if exists "workspaces: owner can insert" on public.workspaces;
create policy "workspaces: owner can insert"
  on public.workspaces for insert
  with check (owner_id = auth.uid());

drop policy if exists "workspaces: owner can update" on public.workspaces;
create policy "workspaces: owner can update"
  on public.workspaces for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "workspaces: owner can delete" on public.workspaces;
create policy "workspaces: owner can delete"
  on public.workspaces for delete
  using (owner_id = auth.uid());

-- --- workspace_members --------------------------------------------------------

drop policy if exists "members: read same workspace" on public.workspace_members;
create policy "members: read same workspace"
  on public.workspace_members for select
  using (
    user_id = auth.uid()
    or workspace_id in (select public.user_workspace_ids())
  );

-- A user may add themselves to a workspace they own (the owner membership row
-- created during onboarding), or to a workspace they already belong to.
drop policy if exists "members: insert into own workspace" on public.workspace_members;
create policy "members: insert into own workspace"
  on public.workspace_members for insert
  with check (
    workspace_id in (select id from public.workspaces where owner_id = auth.uid())
    or workspace_id in (select public.user_workspace_ids())
  );

drop policy if exists "members: update in own workspace" on public.workspace_members;
create policy "members: update in own workspace"
  on public.workspace_members for update
  using (workspace_id in (select public.user_workspace_ids()))
  with check (workspace_id in (select public.user_workspace_ids()));

drop policy if exists "members: delete in own workspace" on public.workspace_members;
create policy "members: delete in own workspace"
  on public.workspace_members for delete
  using (workspace_id in (select public.user_workspace_ids()));

-- --- documents ----------------------------------------------------------------

drop policy if exists "documents: workspace access" on public.documents;
create policy "documents: workspace access"
  on public.documents for all
  using (workspace_id in (select public.user_workspace_ids()))
  with check (workspace_id in (select public.user_workspace_ids()));

-- --- conversations ------------------------------------------------------------

drop policy if exists "conversations: workspace access" on public.conversations;
create policy "conversations: workspace access"
  on public.conversations for all
  using (workspace_id in (select public.user_workspace_ids()))
  with check (workspace_id in (select public.user_workspace_ids()));

-- --- messages -----------------------------------------------------------------
-- messages have no workspace_id of their own; we reach it through the parent
-- conversation.

drop policy if exists "messages: workspace access" on public.messages;
create policy "messages: workspace access"
  on public.messages for all
  using (
    conversation_id in (
      select id from public.conversations
      where workspace_id in (select public.user_workspace_ids())
    )
  )
  with check (
    conversation_id in (
      select id from public.conversations
      where workspace_id in (select public.user_workspace_ids())
    )
  );

-- --- approvals ----------------------------------------------------------------

drop policy if exists "approvals: workspace access" on public.approvals;
create policy "approvals: workspace access"
  on public.approvals for all
  using (workspace_id in (select public.user_workspace_ids()))
  with check (workspace_id in (select public.user_workspace_ids()));

-- ----------------------------------------------------------------------------
-- Onboarding helper
--
-- SECURITY DEFINER so it runs as the DB owner and can bypass RLS.
-- auth.uid() is still available inside the function body — it reads the JWT
-- claims that PostgREST injects before calling into Postgres, so the caller
-- must be authenticated.  We raise an exception if they are not.
-- ----------------------------------------------------------------------------

create or replace function public.create_workspace(
  workspace_name  text,
  workspace_industry   text default null,
  workspace_team_size  text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id     uuid := auth.uid();
  v_workspace_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.workspaces (name, owner_id, industry, team_size)
  values (workspace_name, v_user_id, workspace_industry, workspace_team_size)
  returning id into v_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (v_workspace_id, v_user_id, 'owner');

  return v_workspace_id;
end;
$$;
