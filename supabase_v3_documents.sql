-- ═══════════════════════════════════════════
-- Documents table + Storage setup
-- Exécuter dans Supabase SQL Editor
-- ═══════════════════════════════════════════

-- Supprimer l'ancienne table si elle existe
DROP TABLE IF EXISTS public.documents;

-- Créer la nouvelle table documents
CREATE TABLE public.documents (
  id TEXT PRIMARY KEY,
  client_id TEXT,
  nom TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  statut TEXT DEFAULT 'envoyé',
  date TEXT,
  storage_path TEXT,
  file_size INTEGER DEFAULT 0,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Admin: full access
CREATE POLICY "docs_admin_all" ON public.documents
  FOR ALL USING (public.is_admin());

-- Client: read own documents
CREATE POLICY "docs_client_select" ON public.documents
  FOR SELECT USING (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  );

-- Client: insert own documents
CREATE POLICY "docs_client_insert" ON public.documents
  FOR INSERT WITH CHECK (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  );

-- ═══════════════════════════════════════════
-- Storage bucket (créer manuellement dans Dashboard > Storage)
-- Nom: documents
-- Public: false
-- File size limit: 10MB
-- Allowed MIME types: application/pdf, image/jpeg, image/png, image/webp
-- ═══════════════════════════════════════════

-- Storage policies (exécuter après avoir créé le bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their folder
CREATE POLICY "storage_auth_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents');

-- Allow authenticated users to read their documents
CREATE POLICY "storage_auth_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents');

-- Allow admin to delete
CREATE POLICY "storage_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'documents');
