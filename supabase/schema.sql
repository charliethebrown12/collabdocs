-- CollabDocs schema (Supabase PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL DEFAULT 'Untitled',
  content_json JSONB NOT NULL DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL CHECK (permission IN ('read', 'write')),
  UNIQUE (document_id, user_id)
);

CREATE INDEX IF NOT EXISTS documents_owner_id_idx ON documents(owner_id);
CREATE INDEX IF NOT EXISTS document_shares_user_id_idx ON document_shares(user_id);
CREATE INDEX IF NOT EXISTS document_shares_document_id_idx ON document_shares(document_id);

-- Seeded demo users (stable IDs for the prototype identity switcher)
INSERT INTO users (id, display_name) VALUES
  ('11111111-1111-4111-8111-111111111111', 'Alice Demo'),
  ('22222222-2222-4222-8222-222222222222', 'Bob Demo')
ON CONFLICT (id) DO NOTHING;

-- Optional welcome document for Alice
INSERT INTO documents (id, owner_id, title, content_json) VALUES
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'Welcome to CollabDocs',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Welcome"}]},{"type":"paragraph","content":[{"type":"text","text":"This is Alice'\''s starter document."}]}]}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;
