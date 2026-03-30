import { useState } from 'react';
import { useApp } from '../../context';
import { formatCurrency, formatDate } from '../../data';
import ScoreGauge from '../../components/ScoreGauge';
import Modal from '../../components/Modal';
import {
  Search, ChevronRight, X, Phone, Mail, MapPin, Briefcase,
  CalendarDays, DollarSign, Clock, FileText, Plus, Save, Edit3, Loader2
} from 'lucide-react';

const statusColors = {
  Onboarding: 'badge-blue', Recherche: 'badge-blue', Shortlist: 'badge-gold',
  'Négo': 'badge-orange', Financement: 'badge-orange', Signature: 'badge-green',
  Travaux: 'badge-green', 'Livré': 'badge-green',
};

const paiementColors = {
  Acompte: 'badge-orange', 'Soldé': 'badge-green', 'Impayé': 'badge-red',
};

const emptyClient = {
  prenom: '', nom: '', email: '', telephone: '', ville_residence: '',
  situation_pro: '', revenus_mensuels: '', apport_disponible: '', credits_en_cours: '',
  budget_total: '', villes_cibles: '', type_bien: '', rendement_cible: '',
  objectif: '', tolerance_travaux: '', regime_fiscal: '', source_acquisition: '', notes: '',
};

export default function AdminClients() {
  const { clients, getJournalForClient, getClientBiens, addClient, updateClientData } = useApp();
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyClient);
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setForm(emptyClient); setEditMode(false); setShowModal(true); };
  const openEdit = (client) => {
    setForm({
      ...client,
      villes_cibles: Array.isArray(client.villes_cibles) ? client.villes_cibles.join(', ') : client.villes_cibles || '',
      type_bien: Array.isArray(client.type_bien) ? client.type_bien.join(', ') : client.type_bien || '',
    });
    setEditMode(true); setShowModal(true);
  };
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        ...form,
        villes_cibles: typeof form.villes_cibles === 'string' ? form.villes_cibles.split(',').map(v => v.trim()).filter(Boolean) : form.villes_cibles,
        type_bien: typeof form.type_bien === 'string' ? form.type_bien.split(',').map(v => v.trim()).filter(Boolean) : form.type_bien,
        apport_disponible: parseInt(form.apport_disponible) || 0,
        budget_total: parseInt(form.budget_total) || 0,
        rendement_cible: parseFloat(form.rendement_cible) || 0,
      };
      if (editMode) {
        const { id, created_at, isNew, ...updates } = data;
        await updateClientData(form.id, updates);
      } else {
        await addClient(data);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const filtered = clients.filter(c =>
    `${c.prenom} ${c.nom} ${c.ville_residence} ${c.statut}`.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedClient) {
    const client = selectedClient;
    const journal = getJournalForClient(client.id);
    const clientBiens = getClientBiens(client.id);
    const revenuTotal = (client.honoraires || 0) + (client.commission_courtier || 0);
    const margeNette = revenuTotal - (client.frais_engages || 0);
    const tauxHoraire = client.temps_passe_heures > 0 ? Math.round(margeNette / client.temps_passe_heures) : 0;

    return (
      <div>
        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-md)' }}>
          <button className="btn btn-ghost" onClick={() => setSelectedClient(null)}>← Retour à la liste</button>
          <button className="btn btn-outline btn-sm" onClick={() => openEdit(client)}><Edit3 size={14} /> Modifier</button>
        </div>

        <div className="flex items-center gap-lg" style={{ marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700
          }}>
            {client.prenom[0]}{client.nom[0]}
          </div>
          <div>
            <h1 className="page-title">{client.prenom} {client.nom}</h1>
            <div className="flex gap-sm items-center">
              <span className={`badge ${statusColors[client.statut] || 'badge-gray'}`}>{client.statut}</span>
              <span className={`badge ${paiementColors[client.statut_paiement] || 'badge-gray'}`}>
                {client.statut_paiement}
              </span>
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <ScoreGauge score={client.score_base_profil} size={80} label="Profil" />
          </div>
        </div>

        {/* Contact & Info */}
        <div className="grid-2" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="card">
            <h4 style={{ marginBottom: 'var(--space-md)' }}>Informations</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="flex items-center gap-sm text-sm"><Mail size={14} /> {client.email}</div>
              <div className="flex items-center gap-sm text-sm"><Phone size={14} /> {client.telephone}</div>
              <div className="flex items-center gap-sm text-sm"><MapPin size={14} /> {client.ville_residence}</div>
              <div className="flex items-center gap-sm text-sm"><Briefcase size={14} /> {client.situation_pro}</div>
              <div className="flex items-center gap-sm text-sm"><CalendarDays size={14} /> Onboarding: {formatDate(client.date_onboarding)}</div>
            </div>
          </div>
          <div className="card">
            <h4 style={{ marginBottom: 'var(--space-md)' }}>Cahier des charges</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.875rem' }}>
              <div className="flex justify-between"><span className="text-gray">Budget</span><span style={{ fontWeight: 600 }}>{formatCurrency(client.budget_total)}</span></div>
              <div className="flex justify-between"><span className="text-gray">Apport</span><span style={{ fontWeight: 600 }}>{formatCurrency(client.apport_disponible)}</span></div>
              <div className="flex justify-between"><span className="text-gray">Villes</span><span style={{ fontWeight: 600 }}>{client.villes_cibles?.join(', ')}</span></div>
              <div className="flex justify-between"><span className="text-gray">Rendement cible</span><span style={{ fontWeight: 600 }}>{client.rendement_cible}%</span></div>
              <div className="flex justify-between"><span className="text-gray">Objectif</span><span style={{ fontWeight: 600 }}>{client.objectif}</span></div>
              <div className="flex justify-between"><span className="text-gray">Régime fiscal</span><span style={{ fontWeight: 600 }}>{client.regime_fiscal}</span></div>
              <div className="flex justify-between"><span className="text-gray">Tolérance travaux</span><span style={{ fontWeight: 600 }}>{client.tolerance_travaux}</span></div>
            </div>
          </div>
        </div>

        {/* Suivi financier */}
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <h4 style={{ marginBottom: 'var(--space-md)' }}><DollarSign size={18} style={{ display: 'inline', verticalAlign: 'middle' }} /> Suivi financier</h4>
          <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
            <div className="metric-card" style={{ padding: 'var(--space-md)' }}>
              <div className="metric-label text-xs">Honoraires</div>
              <div style={{ fontWeight: 700 }}>{formatCurrency(client.honoraires)}</div>
            </div>
            <div className="metric-card" style={{ padding: 'var(--space-md)' }}>
              <div className="metric-label text-xs">Acompte reçu</div>
              <div style={{ fontWeight: 700 }}>{formatCurrency(client.acompte_recu)}</div>
            </div>
            <div className="metric-card" style={{ padding: 'var(--space-md)' }}>
              <div className="metric-label text-xs">Commission</div>
              <div style={{ fontWeight: 700 }}>{formatCurrency(client.commission_courtier)}</div>
            </div>
            <div className="metric-card" style={{ padding: 'var(--space-md)' }}>
              <div className="metric-label text-xs">Frais</div>
              <div style={{ fontWeight: 700, color: 'var(--red)' }}>{formatCurrency(client.frais_engages)}</div>
            </div>
            <div className="metric-card" style={{ padding: 'var(--space-md)' }}>
              <div className="metric-label text-xs">Marge nette</div>
              <div style={{ fontWeight: 700, color: 'var(--green)' }}>{formatCurrency(margeNette)}</div>
            </div>
            <div className="metric-card" style={{ padding: 'var(--space-md)' }}>
              <div className="metric-label text-xs">Taux horaire</div>
              <div style={{ fontWeight: 700, color: tauxHoraire < 50 ? 'var(--red)' : 'var(--green)' }}>{tauxHoraire}€/h</div>
              <div className="text-xs text-gray">{client.temps_passe_heures}h passées</div>
            </div>
          </div>
        </div>

        {/* Journal de négo */}
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <h4 style={{ marginBottom: 'var(--space-md)' }}><FileText size={18} style={{ display: 'inline', verticalAlign: 'middle' }} /> Journal de négociation</h4>
          {journal.length > 0 ? (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date/Heure</th><th>Action</th><th>Détail</th><th>Décision client</th>
                  </tr>
                </thead>
                <tbody>
                  {journal.map(j => (
                    <tr key={j.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{j.date_heure}</td>
                      <td><span className={`badge ${j.action === 'Acceptee' ? 'badge-green' : j.action === 'Offre_envoyee' ? 'badge-gold' : j.action === 'Contre_offre' ? 'badge-orange' : 'badge-gray'}`}>{j.action}</span></td>
                      <td>{j.detail_conseil}</td>
                      <td>{j.decision_client || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray">Aucune entrée dans le journal.</p>
          )}
        </div>

        {/* Biens attribués */}
        {clientBiens.length > 0 && (
          <div className="card">
            <h4 style={{ marginBottom: 'var(--space-md)' }}>Biens attribués</h4>
            {clientBiens.map(b => (
              <div key={b.id} className="doc-item" style={{ cursor: 'default' }}>
                <div className="doc-icon" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>
                  <Building2 size={20} />
                </div>
                <div className="doc-info">
                  <div className="doc-name">{b.adresse}, {b.ville}</div>
                  <div className="doc-meta">{b.surface_m2}m² • {formatCurrency(b.prix_affiche)} • Score {b.score_base}/100</div>
                </div>
                <span className={`badge ${b.statut === 'Acquis' ? 'badge-green' : 'badge-gold'}`}>{b.statut}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <h1 className="page-title">👥 Gestion Clients (CRM)</h1>
            <p className="page-subtitle">{clients.length} clients</p>
          </div>
          <div className="flex gap-sm">
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input className="form-input" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36, width: 220 }} />
            </div>
            <button className="btn btn-gold btn-sm" onClick={openAdd}><Plus size={16} /> Ajouter</button>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Client</th><th>Phase</th><th>Score</th><th>Budget</th>
              <th>Ville</th><th>Renta cible</th><th>Onboarding</th><th>Paiement</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(client => (
              <tr key={client.id} onClick={() => setSelectedClient(client)}>
                <td>
                  <div style={{ fontWeight: 600 }}>{client.prenom} {client.nom}</div>
                  <div className="text-xs text-gray">{client.email}</div>
                </td>
                <td><span className={`badge ${statusColors[client.statut] || 'badge-gray'}`}>{client.statut}</span></td>
                <td>
                  <span style={{ fontWeight: 700, color: client.score_base_profil >= 85 ? 'var(--gold)' : client.score_base_profil >= 70 ? 'var(--green)' : 'var(--orange)' }}>
                    {client.score_base_profil}
                  </span>
                </td>
                <td>{formatCurrency(client.budget_total)}</td>
                <td>{client.villes_cibles?.[0]}</td>
                <td>{client.rendement_cible}%</td>
                <td>{formatDate(client.date_onboarding)}</td>
                <td><span className={`badge ${paiementColors[client.statut_paiement] || 'badge-gray'}`}>{client.statut_paiement}</span></td>
                <td><ChevronRight size={16} color="var(--gray-400)" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal Ajout/Modification */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editMode ? 'Modifier le client' : 'Ajouter un client'} width={650}>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Prénom *</label><input className="form-input" value={form.prenom} onChange={e => update('prenom', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Nom *</label><input className="form-input" value={form.nom} onChange={e => update('nom', e.target.value)} /></div>
        </div>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email} onChange={e => update('email', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Téléphone</label><input className="form-input" value={form.telephone} onChange={e => update('telephone', e.target.value)} /></div>
        </div>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Ville</label><input className="form-input" value={form.ville_residence} onChange={e => update('ville_residence', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Situation pro</label>
            <select className="form-select" value={form.situation_pro} onChange={e => update('situation_pro', e.target.value)}>
              <option value="">Sélectionner</option>
              <option>CDI</option><option>CDD</option><option>Fonctionnaire</option>
              <option>Indépendant</option><option>Chef d'entreprise</option><option>Libéral</option><option>Retraité</option>
            </select>
          </div>
        </div>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Budget total (€)</label><input className="form-input" type="number" value={form.budget_total} onChange={e => update('budget_total', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Apport (€)</label><input className="form-input" type="number" value={form.apport_disponible} onChange={e => update('apport_disponible', e.target.value)} /></div>
        </div>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Villes cibles</label><input className="form-input" value={form.villes_cibles} onChange={e => update('villes_cibles', e.target.value)} placeholder="Lyon, Saint-Étienne..." /></div>
          <div className="form-group"><label className="form-label">Rendement cible (%)</label><input className="form-input" type="number" step="0.5" value={form.rendement_cible} onChange={e => update('rendement_cible', e.target.value)} /></div>
        </div>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Objectif</label>
            <select className="form-select" value={form.objectif} onChange={e => update('objectif', e.target.value)}>
              <option value="">Sélectionner</option>
              <option>Rendement</option><option>Patrimoine</option><option>Défiscalisation</option><option>Mixte</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Régime fiscal</label>
            <select className="form-select" value={form.regime_fiscal} onChange={e => update('regime_fiscal', e.target.value)}>
              <option value="">Sélectionner</option>
              <option>LMNP</option><option>Nu</option><option>SCI_IS</option><option>A_definir</option>
            </select>
          </div>
        </div>
        <div className="form-group"><label className="form-label">Source</label>
          <select className="form-select" value={form.source_acquisition} onChange={e => update('source_acquisition', e.target.value)}>
            <option value="">Sélectionner</option>
            <option>Instagram</option><option>YouTube</option><option>Google</option><option>LinkedIn</option><option>Referral</option><option>Autre</option>
          </select>
        </div>
        <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} /></div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 'var(--space-md)' }}>
          <button className="btn btn-outline" onClick={() => setShowModal(false)}>Annuler</button>
          <button className="btn btn-gold" onClick={handleSave} disabled={saving || !form.prenom || !form.nom || !form.email}>
            {saving ? <><Loader2 size={16} className="spin" /> Sauvegarde...</> : <><Save size={16} /> {editMode ? 'Enregistrer' : 'Créer le client'}</>}
          </button>
        </div>
      </Modal>
    </div>
  );
}
