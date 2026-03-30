import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
  mockClients, mockBiens, mockAgences, mockJournalNego,
  mockNotificationsClient, mockNotificationsAdmin, mockAutomatisations,
  mockTravaux, mockDocuments
} from './data';
import { useAuth } from './context/AuthContext';
import { isSupabaseConfigured } from './lib/supabase';
import * as db from './lib/supabaseService';

const AppContext = createContext();

export function AppProvider({ children }) {
  const { clientId: authClientId, isAdmin, user } = useAuth();

  const [clients, setClients] = useState(mockClients);
  const [biens, setBiens] = useState(mockBiens);
  const [agences, setAgences] = useState(mockAgences);
  const [journalNego, setJournalNego] = useState(mockJournalNego);
  const [notificationsClient, setNotificationsClient] = useState(mockNotificationsClient);
  const [notificationsAdmin, setNotificationsAdmin] = useState(mockNotificationsAdmin);
  const [automatisations] = useState(mockAutomatisations);
  const [travaux, setTravaux] = useState(mockTravaux);
  const [documents] = useState(mockDocuments);

  const [dataSource, setDataSource] = useState('mock'); // 'supabase' | 'mock'
  const [dataLoading, setDataLoading] = useState(true);

  // ── Load data from Supabase on mount ──
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setDataLoading(false);
      return;
    }

    async function loadData() {
      try {
        const [dbClients, dbBiens, dbAgences, dbJournal, dbNotifsAdmin, dbNotifsClient] = await Promise.all([
          db.fetchClients(),
          db.fetchBiens(),
          db.fetchAgences(),
          db.fetchJournal(),
          db.fetchNotifications('admin'),
          db.fetchNotifications('client'),
        ]);

        // Only use Supabase data if we got results
        if (dbClients && dbClients.length > 0) {
          setClients(dbClients);
          setDataSource('supabase');
        }
        if (dbBiens && dbBiens.length > 0) setBiens(dbBiens);
        if (dbAgences && dbAgences.length > 0) setAgences(dbAgences);
        if (dbJournal && dbJournal.length > 0) setJournalNego(dbJournal);
        if (dbNotifsAdmin && dbNotifsAdmin.length > 0) setNotificationsAdmin(dbNotifsAdmin);
        if (dbNotifsClient && dbNotifsClient.length > 0) setNotificationsClient(dbNotifsClient);

        if (dbClients && dbClients.length > 0) setDataSource('supabase');
      } catch (err) {
        console.error('Failed to load data from Supabase:', err);
        // Keep mock data as fallback
      } finally {
        setDataLoading(false);
      }
    }

    loadData();
  }, []);

  // Current client: find by authClientId, or create a placeholder from Supabase user
  const currentClientId = authClientId || null;
  const currentClient = useMemo(() => {
    if (isAdmin) return clients[0]; // Admin views default client for demo
    if (currentClientId) {
      const found = clients.find(c => c.id === currentClientId);
      if (found) return found;
    }
    // Try to find by user_id
    if (user?.id) {
      const found = clients.find(c => c.user_id === user.id);
      if (found) return found;
    }
    // New Supabase user — build a placeholder client from auth data
    if (user) {
      const meta = user.user_metadata || {};
      return {
        id: user.id,
        prenom: meta.prenom || user.email?.split('@')[0] || 'Nouveau',
        nom: meta.nom || 'Client',
        email: user.email,
        statut: 'Onboarding',
        phase_actuelle: 'Phase 1',
        budget_total: 0,
        rendement_cible: 0,
        villes_cibles: [],
        type_bien: [],
        apport_disponible: 0,
        objectif: 'À définir',
        regime_fiscal: 'À définir',
        date_onboarding: new Date().toISOString().slice(0, 10),
        score_base_profil: 0,
        isNew: true,
      };
    }
    return null;
  }, [isAdmin, currentClientId, clients, user]);

  const getClientBiens = useCallback((clientId) => {
    return biens.filter(b => b.client_attribue === clientId);
  }, [biens]);

  const getBienById = useCallback((bienId) => {
    return biens.find(b => b.id === bienId);
  }, [biens]);

  const getClientById = useCallback((clientId) => {
    return clients.find(c => c.id === clientId);
  }, [clients]);

  const getAgenceById = useCallback((agenceId) => {
    return agences.find(a => a.id === agenceId);
  }, [agences]);

  const getJournalForClient = useCallback((clientId) => {
    return journalNego.filter(j => j.client_id === clientId);
  }, [journalNego]);

  // ── CRUD: Add Client (from onboarding) ──
  const addClient = useCallback(async (clientData) => {
    const id = db.generateId('c-');
    const newClient = {
      ...clientData,
      id,
      score_base_profil: Math.round(Math.random() * 30 + 65),
      phase_actuelle: 'Phase 1',
      statut: 'Onboarding',
      date_onboarding: new Date().toISOString().slice(0, 10),
      date_livraison: null,
      honoraires: 5000,
      acompte_recu: 0,
      solde_recu: 0,
      commission_courtier: 0,
      frais_engages: 0,
      temps_passe_heures: 0,
      statut_paiement: 'En attente',
    };

    // Save to Supabase
    if (isSupabaseConfigured) {
      try {
        const saved = await db.createClient(newClient);
        if (saved) {
          setClients(prev => [saved, ...prev]);
          // Link profile to client
          if (user?.id) {
            await db.updateProfile(user.id, { client_id: saved.id });
          }
          // Create notification for admin
          await db.addNotification({
            id: db.generateId('na-'),
            date: new Date().toISOString().slice(0, 16).replace('T', ' '),
            type: 'onboarding',
            message: `Nouveau client ${clientData.prenom} ${clientData.nom} — Onboarding soumis`,
            target: 'admin',
            urgent: false,
          });
          return saved;
        }
      } catch (err) {
        console.error('Failed to save client to Supabase:', err);
      }
    }

    // Fallback: local state only
    setClients(prev => [newClient, ...prev]);
    setNotificationsAdmin(prev => [{
      id: 'na-' + Date.now(),
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      type: 'onboarding',
      message: `Nouveau client ${clientData.prenom} ${clientData.nom} — Onboarding soumis`,
      urgent: false,
    }, ...prev]);
    return newClient;
  }, [user]);

  // ── CRUD: Update Client ──
  const updateClientData = useCallback(async (clientId, updates) => {
    if (isSupabaseConfigured) {
      try {
        const saved = await db.updateClient(clientId, updates);
        if (saved) {
          setClients(prev => prev.map(c => c.id === clientId ? saved : c));
          return saved;
        }
      } catch (err) {
        console.error('Failed to update client:', err);
      }
    }
    // Fallback
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...updates } : c));
  }, []);

  // ── CRUD: Add Bien ──
  const addBien = useCallback(async (bienData) => {
    const id = db.generateId('b-');
    const newBien = { ...bienData, id };

    if (isSupabaseConfigured) {
      try {
        const saved = await db.createBien(newBien);
        if (saved) {
          setBiens(prev => [saved, ...prev]);
          return saved;
        }
      } catch (err) {
        console.error('Failed to save bien:', err);
      }
    }
    setBiens(prev => [newBien, ...prev]);
    return newBien;
  }, []);

  // ── CRUD: Update Bien ──
  const updateBienData = useCallback(async (bienId, updates) => {
    if (isSupabaseConfigured) {
      try {
        const saved = await db.updateBien(bienId, updates);
        if (saved) {
          setBiens(prev => prev.map(b => b.id === bienId ? saved : b));
          return saved;
        }
      } catch (err) {
        console.error('Failed to update bien:', err);
      }
    }
    setBiens(prev => prev.map(b => b.id === bienId ? { ...b, ...updates } : b));
  }, []);

  // ── CRUD: Add Agence ──
  const addAgence = useCallback(async (agenceData) => {
    const id = db.generateId('a-');
    const newAgence = { ...agenceData, id };

    if (isSupabaseConfigured) {
      try {
        const saved = await db.createAgence(newAgence);
        if (saved) {
          setAgences(prev => [saved, ...prev]);
          return saved;
        }
      } catch (err) {
        console.error('Failed to save agence:', err);
      }
    }
    setAgences(prev => [newAgence, ...prev]);
    return newAgence;
  }, []);

  // ── CRUD: Update Agence ──
  const updateAgenceData = useCallback(async (agenceId, updates) => {
    if (isSupabaseConfigured) {
      try {
        const saved = await db.updateAgence(agenceId, updates);
        if (saved) {
          setAgences(prev => prev.map(a => a.id === agenceId ? saved : a));
          return saved;
        }
      } catch (err) {
        console.error('Failed to update agence:', err);
      }
    }
    setAgences(prev => prev.map(a => a.id === agenceId ? { ...a, ...updates } : a));
  }, []);

  // ── Trigger: Validate Pitch Deck ──
  const validatePitchDeck = useCallback(async (bienId) => {
    await updateBienData(bienId, { statut: 'Offre_envoyée' });

    const entry = {
      id: db.generateId('n-'),
      client_id: currentClient?.id,
      bien_id: bienId,
      date_heure: new Date().toISOString().slice(0, 16).replace('T', ' '),
      action: 'Offre_envoyee',
      detail_conseil: 'Client a validé l\'offre via le Pitch Deck.',
      decision_client: 'Validé',
    };

    if (isSupabaseConfigured) {
      try {
        const saved = await db.addJournalEntry(entry);
        if (saved) setJournalNego(prev => [saved, ...prev]);
        await db.addNotification({
          id: db.generateId('na-'),
          date: entry.date_heure,
          type: 'pitch',
          message: `Client a validé le Pitch Deck — Offre à envoyer (Bien #${bienId})`,
          target: 'admin',
          urgent: true,
        });
      } catch (err) {
        console.error('Failed to save journal entry:', err);
      }
    } else {
      setJournalNego(prev => [entry, ...prev]);
      setNotificationsAdmin(prev => [{
        id: 'na-' + Date.now(),
        date: entry.date_heure,
        type: 'pitch',
        message: `Client a validé le Pitch Deck — Offre à envoyer (Bien #${bienId})`,
        urgent: true,
      }, ...prev]);
    }
  }, [currentClient, updateBienData]);

  // ── Trigger: Update bien status ──
  const updateBienStatut = useCallback(async (bienId, newStatut) => {
    await updateBienData(bienId, { statut: newStatut });
  }, [updateBienData]);

  // ── Trigger: Update client status ──
  const updateClientStatut = useCallback(async (clientId, newStatut) => {
    await updateClientData(clientId, { statut: newStatut });
  }, [updateClientData]);

  // ── Toggle travaux checklist ──
  const toggleTravauxChecklist = useCallback((index) => {
    setTravaux(prev => ({
      ...prev,
      checklist_reception: prev.checklist_reception.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      ),
    }));
  }, []);

  const value = {
    clients, biens, agences, journalNego, notificationsClient, notificationsAdmin,
    automatisations, travaux, documents,
    currentClient, currentClientId,
    dataSource, dataLoading,
    getClientBiens, getBienById, getClientById, getAgenceById, getJournalForClient,
    validatePitchDeck, updateBienStatut, updateClientStatut,
    addClient, updateClientData,
    addBien, updateBienData,
    addAgence, updateAgenceData,
    toggleTravauxChecklist,
    setClients, setBiens, setAgences,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
