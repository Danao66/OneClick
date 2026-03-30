import { createContext, useContext, useState, useCallback } from 'react';
import {
  mockClients, mockBiens, mockAgences, mockJournalNego,
  mockNotificationsClient, mockNotificationsAdmin, mockAutomatisations,
  mockTravaux, mockDocuments
} from './data';
import { useAuth } from './context/AuthContext';

const AppContext = createContext();

export function AppProvider({ children }) {
  const { clientId: authClientId, isAdmin } = useAuth();

  const [clients, setClients] = useState(mockClients);
  const [biens, setBiens] = useState(mockBiens);
  const [agences, setAgences] = useState(mockAgences);
  const [journalNego, setJournalNego] = useState(mockJournalNego);
  const [notificationsClient] = useState(mockNotificationsClient);
  const [notificationsAdmin, setNotificationsAdmin] = useState(mockNotificationsAdmin);
  const [automatisations] = useState(mockAutomatisations);
  const [travaux, setTravaux] = useState(mockTravaux);
  const [documents] = useState(mockDocuments);

  // Current client is determined by auth
  const currentClientId = authClientId || 'c1';
  const currentClient = clients.find(c => c.id === currentClientId);

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

  // Trigger: Client validates Pitch Deck
  const validatePitchDeck = useCallback((bienId) => {
    setBiens(prev => prev.map(b =>
      b.id === bienId ? { ...b, statut: 'Offre_envoyée' } : b
    ));
    setNotificationsAdmin(prev => [{
      id: 'na-' + Date.now(),
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      type: 'pitch',
      message: `Client a validé le Pitch Deck — Offre à envoyer (Bien #${bienId})`,
      urgent: true,
    }, ...prev]);
    setJournalNego(prev => [...prev, {
      id: 'n-' + Date.now(),
      client_id: currentClientId,
      bien_id: bienId,
      date_heure: new Date().toISOString().slice(0, 16).replace('T', ' '),
      action: 'Offre_envoyee',
      detail_conseil: 'Client a validé l\'offre via le Pitch Deck.',
      decision_client: 'Validé',
    }]);
  }, [currentClientId]);

  // Trigger: Update bien status
  const updateBienStatut = useCallback((bienId, newStatut) => {
    setBiens(prev => prev.map(b =>
      b.id === bienId ? { ...b, statut: newStatut } : b
    ));
  }, []);

  // Trigger: Update client status
  const updateClientStatut = useCallback((clientId, newStatut) => {
    setClients(prev => prev.map(c =>
      c.id === clientId ? { ...c, statut: newStatut } : c
    ));
  }, []);

  // Add a new client (from onboarding)
  const addClient = useCallback((clientData) => {
    const newClient = {
      ...clientData,
      id: 'c' + (clients.length + 1),
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
      statut_paiement: 'Acompte',
    };
    setClients(prev => [...prev, newClient]);
    setNotificationsAdmin(prev => [{
      id: 'na-' + Date.now(),
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      type: 'onboarding',
      message: `Nouveau client ${clientData.prenom} ${clientData.nom} — Onboarding soumis`,
      urgent: false,
    }, ...prev]);
    return newClient;
  }, [clients.length]);

  // Toggle travaux checklist
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
    getClientBiens, getBienById, getClientById, getAgenceById, getJournalForClient,
    validatePitchDeck, updateBienStatut, updateClientStatut, addClient,
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
