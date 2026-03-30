import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext();

// Demo mode credentials (when Supabase is not configured)
const DEMO_ADMIN = { email: 'admin@cleenmain.fr', password: 'admin123' };
const DEMO_CLIENTS = {
  'julien.moreau@email.com': { password: 'client123', clientId: 'c1', prenom: 'Julien', nom: 'Moreau' },
  'sophie.durand@cabinet.fr': { password: 'client123', clientId: 'c2', prenom: 'Sophie', nom: 'Durand' },
  'marc.lefevre@startup.io': { password: 'client123', clientId: 'c3', prenom: 'Marc', nom: 'Lefèvre' },
  'claire.b@finance.com': { password: 'client123', clientId: 'c4', prenom: 'Claire', nom: 'Bernard' },
  'antoine.girard@medical.fr': { password: 'client123', clientId: 'c5', prenom: 'Antoine', nom: 'Girard' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin' | 'client'
  const [clientId, setClientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Supabase Mode ──
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Check localStorage for demo session
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

    // Supabase: Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Supabase: Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchUserRole(session.user.id);
        } else {
          setUser(null);
          setUserRole(null);
          setClientId(null);
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

    if (!isSupabaseConfigured) {
      // Demo mode
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
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message === 'Invalid login credentials'
        ? 'Email ou mot de passe incorrect'
        : authError.message);
      throw authError;
    }

    // Fetch role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, client_id')
      .eq('id', data.user.id)
      .single();

    return { role: profile?.role || 'client' };
  }, []);

  // ── Sign Out ──
  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setUserRole(null);
    setClientId(null);
    localStorage.removeItem('cleenmain_session');
  }, []);

  // ── Sign Up (for new clients) ──
  const signUp = useCallback(async (email, password, metadata = {}) => {
    setError(null);

    if (!isSupabaseConfigured) {
      setError('Inscription non disponible en mode démo');
      throw new Error('Demo mode');
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
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
