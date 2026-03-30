import { supabase, isSupabaseConfigured } from './supabase';

// ═══════════════════════════════════════════
// Supabase Service Layer — CRUD Operations
// Fallback to null when Supabase is not configured
// ═══════════════════════════════════════════

// ── CLIENTS ──

export async function fetchClients() {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchClients:', error.message); return null; }
  return data;
}

export async function createClient(clientData) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('clients')
    .insert(clientData)
    .select()
    .single();
  if (error) { console.error('createClient:', error.message); throw error; }
  return data;
}

export async function updateClient(clientId, updates) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', clientId)
    .select()
    .single();
  if (error) { console.error('updateClient:', error.message); throw error; }
  return data;
}

export async function deleteClient(clientId) {
  if (!isSupabaseConfigured) return null;
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId);
  if (error) { console.error('deleteClient:', error.message); throw error; }
  return true;
}

// ── BIENS ──

export async function fetchBiens() {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('biens')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchBiens:', error.message); return null; }
  return data;
}

export async function createBien(bienData) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('biens')
    .insert(bienData)
    .select()
    .single();
  if (error) { console.error('createBien:', error.message); throw error; }
  return data;
}

export async function updateBien(bienId, updates) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('biens')
    .update(updates)
    .eq('id', bienId)
    .select()
    .single();
  if (error) { console.error('updateBien:', error.message); throw error; }
  return data;
}

export async function deleteBien(bienId) {
  if (!isSupabaseConfigured) return null;
  const { error } = await supabase
    .from('biens')
    .delete()
    .eq('id', bienId);
  if (error) { console.error('deleteBien:', error.message); throw error; }
  return true;
}

// ── AGENCES ──

export async function fetchAgences() {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('agences')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchAgences:', error.message); return null; }
  return data;
}

export async function createAgence(agenceData) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('agences')
    .insert(agenceData)
    .select()
    .single();
  if (error) { console.error('createAgence:', error.message); throw error; }
  return data;
}

export async function updateAgence(agenceId, updates) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('agences')
    .update(updates)
    .eq('id', agenceId)
    .select()
    .single();
  if (error) { console.error('updateAgence:', error.message); throw error; }
  return data;
}

// ── JOURNAL NEGO ──

export async function fetchJournal() {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('journal_nego')
    .select('*')
    .order('date_heure', { ascending: false });
  if (error) { console.error('fetchJournal:', error.message); return null; }
  return data;
}

export async function addJournalEntry(entry) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('journal_nego')
    .insert(entry)
    .select()
    .single();
  if (error) { console.error('addJournalEntry:', error.message); throw error; }
  return data;
}

// ── NOTIFICATIONS ──

export async function fetchNotifications(target = 'admin') {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('target', target)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) { console.error('fetchNotifications:', error.message); return null; }
  return data;
}

export async function addNotification(notification) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();
  if (error) { console.error('addNotification:', error.message); return null; }
  return data;
}

// ── PROFILES ──

export async function updateProfile(userId, updates) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) { console.error('updateProfile:', error.message); throw error; }
  return data;
}

// ── HELPERS ──

export function generateId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
