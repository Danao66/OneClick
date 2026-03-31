import { supabase, isSupabaseConfigured } from './supabase';

const BUCKET = 'documents';

// ── Initialize bucket (run once) ──
export async function ensureBucket() {
  if (!isSupabaseConfigured) return;
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find(b => b.name === BUCKET)) {
    await supabase.storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    });
  }
}

// ── Upload a file ──
export async function uploadDocument(file, clientId, category = 'general') {
  if (!isSupabaseConfigured) throw new Error('Storage not configured');
  
  const ext = file.name.split('.').pop();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${clientId}/${category}/${Date.now()}_${safeName}`;
  
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    
  if (error) throw error;
  
  // Save metadata to documents table
  const { data: doc, error: dbErr } = await supabase
    .from('documents')
    .insert({
      id: 'd-' + Date.now().toString(36),
      client_id: clientId,
      nom: file.name,
      type: category,
      statut: 'envoyé',
      date: new Date().toISOString().slice(0, 10),
      storage_path: data.path,
      file_size: file.size,
      mime_type: file.type,
    })
    .select()
    .single();
    
  if (dbErr) console.error('Error saving doc metadata:', dbErr);
  return doc || { path: data.path, name: file.name };
}

// ── List documents for a client ──
export async function fetchDocuments(clientId) {
  if (!isSupabaseConfigured) return null;
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
    
  if (error) { console.error('fetchDocuments:', error.message); return null; }
  return data;
}

// ── List all documents (admin) ──
export async function fetchAllDocuments() {
  if (!isSupabaseConfigured) return null;
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) { console.error('fetchAllDocuments:', error.message); return null; }
  return data;
}

// ── Get download URL ──
export async function getDocumentUrl(storagePath) {
  if (!isSupabaseConfigured) return null;
  
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600); // 1h valid
    
  if (error) { console.error('getDocumentUrl:', error.message); return null; }
  return data.signedUrl;
}

// ── Delete document ──
export async function deleteDocument(docId, storagePath) {
  if (!isSupabaseConfigured) return;
  
  // Delete from storage
  if (storagePath) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
  }
  
  // Delete from DB
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', docId);
    
  if (error) throw error;
}

// ── Format file size ──
export function formatFileSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' o';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' Ko';
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
}
