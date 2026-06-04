CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS app_versions (
    id boolean PRIMARY KEY DEFAULT true,
    version text NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT app_versions_singleton CHECK (id)
);

INSERT INTO app_versions (id, version)
VALUES (true, '0.1.0')
ON CONFLICT (id) DO NOTHING;
