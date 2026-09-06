-- "This number looks wrong" feedback from the toolkit calculators.
-- Public, anonymous submissions — no user_id (auth is not wired up on this
-- site; see src/lib/auth). Numbered 0002 so it never collides with
-- migrations/auth/0001_auth.sql if sign-in is ever turned on later (that file
-- gets copied to migrations/0001_auth.sql per the note in migration-plan.mjs).

create table if not exists toolkit_feedback (
  id bigserial primary key,
  tool_id text not null,
  path text not null,
  url text,
  message text,
  locale text not null default 'nl',
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create index if not exists toolkit_feedback_created_at_idx on toolkit_feedback (created_at desc);
create index if not exists toolkit_feedback_tool_id_idx on toolkit_feedback (tool_id);
