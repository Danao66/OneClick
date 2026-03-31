import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext();

// Cache key for persisting auth state
const CACHE_KEY = 'cleenmain_auth_cache';

// Demo mode credentials (when Supabase is not configured)
const DEMO_ADMIN = { email: 'admin@cleenmain.fr', password: 'admin123' };
const DEMO_CLIENTS = {
  'julien.moreau@email.com': { password: 'client123', clientId: 'c1', prenom: 'Julien', nom: 'Moreau' },
  'sophie.durand@cabinet.fr': { password: 'client123', clientId: 'c2', prenom: 'Sophie', nom: 'Durand' },
  'marc.lefevre@startup.io': { password: 'client123', clientId: 'c3', prenom: 'Marc', nom: 'Lefèvre' },
  'claire.b@finance.com': { password: 'client123', clientId: 'c4', prenom: 'Claire', nom: 'Bernard' },
  'antoine.girard@medical.fr': { password: 'client123', clientId: 'c5', prenom: 'Antoine', nom: 'Girard' },
};

// Read cached auth state for instant rendering
function getCachedAuth() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch { /* ignore */ }
  return null;
}

function setCachedAuth(user, role, clientId) {
  try {
    if (user) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ user, role, clientId, ts: Date.now() }));
    } else {
      localStorage.removeItem(CACHE_KEY);
    }
  } catch { /* ignore */ }
}

export function AuthProvider({ children }) {
  // Initialize from cache for instant rendering
  const cached = useRef(getCachedAuth()).current;

  const [user, setUser] = useState(cached?.user || null);
  const [userRole, setUserRole] = useState(cached?.role || null);
  const [clientId, setClientId] = useState(cached?.clientId || null);
  // If we have cached data, don't show loading spinner
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Demo mode: check localStorage
      const saved = localStorage.getItem('cleenmain_session');
      if (saved) {
        try {
          const session = JSON.parse(saved);
          setUser(session.user);
          setUserRole(session.role);
          setClientId(session.clientId);
        } catch { /* ignore */ }
      }
      setLoading(false);
      return;
    }

    // Supabase: Get initial session (verify cache in background)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserRole(session.user.id);
      } else {
        // No valid session — clear cache
        setUser(null);
        setUserRole(null);
        setClientId(null);
        setCachedAuth(null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchUserRole(session.user.id);
        } else {
          setUser(null);
          setUserRole(null);
          setClientId(null);
          setCachedAuth(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, client_id')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserRole(data.role);
      setClientId(data.client_id);
      // Cache for next page load
      setCachedAuth(
        { id: userId },
        data.role,
        data.client_id
      );
    } catch (err) {
      console.error('Error fetching role:', err);
      setUserRole('client');
    } finally {
      setLoading(false);
    }
  };

  // ── Sign In ──
  const signIn = useCallback(async (email, password) => {
    setError(null);
    // Clear stale cache before new login
    setCachedAuth(null);
    setUserRole(null);
    setClientId(null);

    if (!isSupabaseConfigured) {
      if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
        const session = { user: { email, id: 'admin' }, role: 'admin', clientId: null };
        setUser(session.user);
        setUserRole('admin');
        setClientId(null);
        localStorage.setItem('cleenmain_session', JSON.stringify(session));
        return { role: 'admin' };
      }
      const client = DEMO_CLIENTS[email];
      if (client && password === client.password) {
        const session = { user: { email, id: client.clientId, prenom: client.prenom, nom: client.nom }, role: 'client', clientId: client.clientId };
        setUser(session.user);
        setUserRole('client');
        setClientId(client.clientId);
        localStorage.setItem('cleenmain_session', JSON.stringify(session));
        return { role: 'client' };
      }
      setError('Email ou mot de passe incorrect');
      throw new Error('Invalid credentials');
    }

    // Supabase mode
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      const msg = authError.message === 'Invalid login credentials'
        ? 'Email ou mot de passe incorrect'
        : authError.message === 'Email not confirmed'
        ? 'Veuillez confirmer votre email avant de vous connecter'
        : authError.message;
      setError(msg);
      throw authError;
    }

    // Fetch role — with retry
    let role = 'client';
    let profileClientId = null;
    try {
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('role, client_id')
        .eq('id', data.user.id)
        .single();

      if (!profErr && profile) {
        role = profile.role || 'client';
        profileClientId = profile.client_id;
      }
    } catch (err) {
      console.error('Error fetching profile on login:', err);
    }

    setUser(data.user);
    setUserRole(role);
    setClientId(profileClientId);
    setCachedAuth(data.user, role, profileClientId);

    return { role };
  }, []);

  // ── Sign Out ──
  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setUserRole(null);
    setClientId(null);
    setCachedAuth(null);
    localStorage.removeItem('cleenmain_session');
  }, []);

  // ── Sign Up ──
  const signUp = useCallback(async (email, password, metadata = {}) => {
    setError(null);

    if (!isSupabaseConfigured) {
      setError('Inscription non disponible en mode démo');
      throw new Error('Demo mode');
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });

    if (signUpError) {
      const msg = signUpError.message === 'User already registered'
        ? 'Un compte existe déjà avec cet email'
        : signUpError.message;
      setError(msg);
      throw signUpError;
    }

    return data;
  }, []);

  const value = {
    user,
    userRole,
    clientId,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: userRole === 'admin',
    isClient: userRole === 'client',
    isDemo: !isSupabaseConfigured,
    signIn,
    signOut,
    signUp,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
