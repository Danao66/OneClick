import { useState } from 'react';
import { useApp } from '../../context';
import { formatCurrency, formatDate, getScoreColor, getChecklistProgress } from '../../data';
import ScoreGauge from '../../components/ScoreGauge';
import Modal from '../../components/Modal';
import {
  Search, Filter, ChevronRight, MapPin, Ruler, Thermometer,
  CheckCircle2, X, ExternalLink, AlertTriangle, Building2, Plus, Save, Loader2
} from 'lucide-react';

const statusColors = {
  'Identifié': 'badge-gray', 'En_analyse': 'badge-blue', 'Shortlisté': 'badge-gold',
  'Offre_envoyée': 'badge-orange', 'Offre_acceptée': 'badge-green', 'Acquis': 'badge-green', 'Rejeté': 'badge-red',
};

const checklistLabels = {
  photos_hd: { label: 'Photos HD 10+', obligatoire: true, impact: '-20%' },
  video_360: { label: 'Vidéo 360° int/ext', obligatoire: true, impact: '-15%' },
  charges_tf: { label: 'Charges copro + TF 3 ans PDF', obligatoire: true, impact: '-10%' },
  dpe_factures: { label: 'DPE + factures énergie 12 mois', obligatoire: true, impact: '-12%' },
  historique_loyers: { label: 'Historique loyers LLD/LCD', obligatoire: true, impact: '-8%' },
  diagnostics: { label: 'Diagnostics assainissement', obligatoire: true, impact: '-10%' },
  regles_copro: { label: 'Règles copro LCD/colloc/division', obligatoire: true, impact: '-15%' },
  pv_ag: { label: 'Plan copro + PV AG', obligatoire: true, impact: '-10%' },
  factures_recentes: { label: 'Factures eau/élec 3 mois', obligatoire: true, impact: '-5%' },
  excel_exploitation: { label: 'Excel exploitation si loué', obligatoire: false, impact: '-25%' },
  photos_avant_apres: { label: 'Photos avant/après si travaux', obligatoire: false, impact: '+10%' },
  autorisation_visite: { label: 'Autorisation visite VA/Visio', obligatoire: true, impact: 'Bloquant' },
  dvf_compars: { label: 'DVF comparables quartier 3 biens', obligatoire: true, impact: '-10%' },
};

const emptyBien = {
  adresse: '', ville: '', surface_m2: '', prix_affiche: '', dpe: '',
  charges_copro: '', taxe_fonciere: '', loyer_estime: '', travaux_estimes: '',
  source: '', lien_annonce: '', client_attribue: '', notes: '', verdict_expert: '',
};

export default function AdminBiens() {
  const { biens, clients, setBiens, addBien } = useApp();
  const [search, setSearch] = useState('');
  const [selectedBien, setSelectedBien] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyBien);
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setForm(emptyBien); setShowModal(true); };
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const s = parseInt(form.surface_m2)||0, p = parseInt(form.prix_affiche)||0;
      const loyer = parseInt(form.loyer_estime)||0;
      const data = {
        ...form,
        surface_m2: s, prix_affiche: p, prix_m2: s > 0 ? Math.round(p/s) : 0,
        charges_copro: parseInt(form.charges_copro)||0,
        taxe_fonciere: parseInt(form.taxe_fonciere)||0,
        loyer_estime: loyer,
        travaux_estimes: parseInt(form.travaux_estimes)||0,
        rentabilite_brute: p > 0 ? Math.round((loyer*12/p)*1000)/10 : 0,
        statut: 'Identifié',
        date_sourcing: new Date().toISOString().slice(0,10),
        client_attribue: form.client_attribue || null,
      };
      await addBien(data);
      setShowModal(false);
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const filtered = biens.filter(b => {
    const matchSearch = `${b.adresse} ${b.ville} ${b.statut}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? b.statut === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const toggleChecklist = (bienId, key) => {
    setBiens(prev => prev.map(b => {
      if (b.id !== bienId) return b;
      return {
        ...b,
        checklist_vendeur: { ...b.checklist_vendeur, [key]: !b.checklist_vendeur[key] }
      };
    }));
    if (selectedBien?.id === bienId) {
      setSelectedBien(prev => ({
        ...prev,
        checklist_vendeur: { ...prev.checklist_vendeur, [key]: !prev.checklist_vendeur[key] }
      }));
    }
  };

  if (selectedBien) {
    const bien = biens.find(b => b.id === selectedBien.id) || selectedBien;
    const client = clients.find(c => c.id === bien.client_attribue);
    const progress = getChecklistProgress(bien.checklist_vendeur);

    return (
      <div>
        <button className="btn btn-ghost" onClick={() => setSelectedBien(null)} style={{ marginBottom: 'var(--space-md)' }}>
          ← Retour à la liste
        </button>

        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <h1 className="page-title">{bien.adresse}</h1>
            <div className="flex gap-sm items-center">
              <span className="flex items-center gap-sm text-gray"><MapPin size={14} /> {bien.ville}</span>
              <span className={`badge ${statusColors[bien.statut] || 'badge-gray'}`}>{bien.statut.replace('_', ' ')}</span>
              {client && <span className="badge badge-blue">Client: {client.prenom} {client.nom}</span>}
            </div>
          </div>
          <ScoreGauge score={bien.score_base} size={100} />
        </div>

        {/* Data */}
        <div className="grid-3" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="card">
            <h4 style={{ marginBottom: 'var(--space-md)', fontSize: '0.85rem', color: 'var(--gray-500)' }}>BIEN</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.875rem' }}>
              <div className="flex justify-between"><span className="text-gray">Surface</span><span style={{ fontWeight: 600 }}>{bien.surface_m2} m²</span></div>
              <div className="flex justify-between"><span className="text-gray">Prix affiché</span><span style={{ fontWeight: 600 }}>{formatCurrency(bien.prix_affiche)}</span></div>
              <div className="flex justify-between"><span className="text-gray">Prix/m²</span><span style={{ fontWeight: 600 }}>{formatCurrency(bien.prix_m2)}</span></div>
              <div className="flex justify-between"><span className="text-gray">DPE</span><span style={{ fontWeight: 600 }}>{bien.dpe}</span></div>
              <div className="flex justify-between"><span className="text-gray">Source</span><span style={{ fontWeight: 600 }}>{bien.source}</span></div>
            </div>
          </div>
          <div className="card">
            <h4 style={{ marginBottom: 'var(--space-md)', fontSize: '0.85rem', color: 'var(--gray-500)' }}>FINANCIER</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.875rem' }}>
              <div className="flex justify-between"><span className="text-gray">Loyer estimé</span><span style={{ fontWeight: 600 }}>{formatCurrency(bien.loyer_estime)}/mois</span></div>
              <div className="flex justify-between"><span className="text-gray">Charges copro</span><span style={{ fontWeight: 600 }}>{formatCurrency(bien.charges_copro)}/mois</span></div>
              <div className="flex justify-between"><span className="text-gray">Taxe foncière</span><span style={{ fontWeight: 600 }}>{formatCurrency(bien.taxe_fonciere)}/an</span></div>
              <div className="flex justify-between"><span className="text-gray">Renta brute</span><span style={{ fontWeight: 600 }}>{bien.rentabilite_brute}%</span></div>
              <div className="flex justify-between"><span className="text-gray">Renta nette</span><span style={{ fontWeight: 600, color: 'var(--green)' }}>{bien.rentabilite_nette}%</span></div>
              <div className="flex justify-between"><span className="text-gray">Cashflow</span><span style={{ fontWeight: 600, color: bien.cashflow_mensuel >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatCurrency(bien.cashflow_mensuel)}/mois</span></div>
            </div>
          </div>
          <div className="card">
            <h4 style={{ marginBottom: 'var(--space-md)', fontSize: '0.85rem', color: 'var(--gray-500)' }}>TRAVAUX</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.875rem' }}>
              <div className="flex justify-between"><span className="text-gray">Travaux</span><span style={{ fontWeight: 600 }}>{formatCurrency(bien.travaux_estimes)}</span></div>
              <div className="flex justify-between"><span className="text-gray">Ameublement</span><span style={{ fontWeight: 600 }}>{formatCurrency(bien.ameublement)}</span></div>
              <div className="flex justify-between"><span className="text-gray">Date sourcing</span><span style={{ fontWeight: 600 }}>{formatDate(bien.date_sourcing)}</span></div>
            </div>
            {bien.lien_annonce && (
              <a href={bien.lien_annonce} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ marginTop: 'var(--space-md)' }}>
                <ExternalLink size={14} /> Voir annonce
              </a>
            )}
          </div>
        </div>

        {/* Verdict */}
        {bien.verdict_expert && (
          <div className="card" style={{ marginBottom: 'var(--space-lg)', borderLeft: '4px solid var(--gold)' }}>
            <h4 style={{ marginBottom: 'var(--space-sm)' }}>Verdict expert</h4>
            <p style={{ marginBottom: 0 }}>{bien.verdict_expert}</p>
          </div>
        )}

        {/* Checklist vendeur */}
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="card-header">
            <h4>📋 Checklist vendeur</h4>
            <div className="flex items-center gap-sm">
              <span className="text-sm" style={{ fontWeight: 600 }}>{progress}%</span>
              {progress === 100 && <span className="badge badge-green">Nego Ready ✓</span>}
              {progress < 85 && <span className="badge badge-red">Bloqué</span>}
            </div>
          </div>
          <div className="progress-bar-container" style={{ marginBottom: 'var(--space-md)' }}>
            <div className="progress-bar-fill" style={{ width: `${progress}%`, background: progress === 100 ? 'var(--green)' : progress >= 85 ? 'var(--gold)' : 'var(--orange)' }} />
          </div>
          <div className="checklist">
            {Object.entries(checklistLabels).map(([key, info]) => (
              <div
                key={key}
                className={`checklist-item ${bien.checklist_vendeur?.[key] ? 'checked' : ''}`}
                onClick={() => toggleChecklist(bien.id, key)}
                style={{ cursor: 'pointer' }}
              >
                <div className="checklist-checkbox">
                  {bien.checklist_vendeur?.[key] && <CheckCircle2 size={14} />}
                </div>
                <div className="checklist-label">
                  {info.label}
                  {info.obligatoire && <span className="text-xs text-red" style={{ marginLeft: 4 }}>*</span>}
                </div>
                <div className="checklist-impact">
                  {info.impact}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {bien.notes && (
          <div className="card">
            <h4 style={{ marginBottom: 'var(--space-sm)' }}>Notes</h4>
            <p className="text-gray" style={{ marginBottom: 0 }}>{bien.notes}</p>
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
            <h1 className="page-title">🏠 Base de Biens</h1>
            <p className="page-subtitle">{biens.length} biens</p>
          </div>
          <div className="flex gap-sm">
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input className="form-input" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36, width: 220 }} />
            </div>
            <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 160 }}>
              <option value="">Tous statuts</option>
              <option>Identifié</option><option>En_analyse</option><option>Shortlisté</option>
              <option>Offre_envoyée</option><option>Offre_acceptée</option><option>Acquis</option><option>Rejeté</option>
            </select>
            <button className="btn btn-gold btn-sm" onClick={openAdd}><Plus size={16} /> Ajouter</button>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Adresse</th><th>Ville</th><th>Prix</th><th>Surface</th>
              <th>€/m²</th><th>Score</th><th>Renta brute</th><th>DPE</th>
              <th>Statut</th><th>Client</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(bien => {
              const client = clients.find(c => c.id === bien.client_attribue);
              return (
                <tr key={bien.id} onClick={() => setSelectedBien(bien)}>
                  <td style={{ fontWeight: 600 }}>{bien.adresse}</td>
                  <td>{bien.ville}</td>
                  <td>{formatCurrency(bien.prix_affiche)}</td>
                  <td>{bien.surface_m2} m²</td>
                  <td>{formatCurrency(bien.prix_m2)}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: getScoreColor(bien.score_base) }}>{bien.score_base}</span>
                  </td>
                  <td>{bien.rentabilite_brute}%</td>
                  <td>
                    <span className={`badge ${['F','G'].includes(bien.dpe) ? 'badge-red' : bien.dpe === 'E' ? 'badge-orange' : 'badge-green'}`}>
                      {bien.dpe}
                    </span>
                  </td>
                  <td><span className={`badge ${statusColors[bien.statut] || 'badge-gray'}`}>{bien.statut.replace('_', ' ')}</span></td>
                  <td>{client ? `${client.prenom} ${client.nom[0]}.` : '—'}</td>
                  <td><ChevronRight size={16} color="var(--gray-400)" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Ajout */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Ajouter un bien" width={600}>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Adresse *</label><input className="form-input" value={form.adresse} onChange={e => update('adresse', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Ville *</label><input className="form-input" value={form.ville} onChange={e => update('ville', e.target.value)} /></div>
        </div>
        <div className="grid-3">
          <div className="form-group"><label className="form-label">Surface (m²)</label><input className="form-input" type="number" value={form.surface_m2} onChange={e => update('surface_m2', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Prix affiché (€)</label><input className="form-input" type="number" value={form.prix_affiche} onChange={e => update('prix_affiche', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">DPE</label>
            <select className="form-select" value={form.dpe} onChange={e => update('dpe', e.target.value)}>
              <option value="">-</option><option>A</option><option>B</option><option>C</option><option>D</option><option>E</option><option>F</option><option>G</option>
            </select>
          </div>
        </div>
        <div className="grid-3">
          <div className="form-group"><label className="form-label">Loyer estimé (€/mois)</label><input className="form-input" type="number" value={form.loyer_estime} onChange={e => update('loyer_estime', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Charges copro (€/mois)</label><input className="form-input" type="number" value={form.charges_copro} onChange={e => update('charges_copro', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Taxe foncière (€/an)</label><input className="form-input" type="number" value={form.taxe_fonciere} onChange={e => update('taxe_fonciere', e.target.value)} /></div>
        </div>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Travaux estimés (€)</label><input className="form-input" type="number" value={form.travaux_estimes} onChange={e => update('travaux_estimes', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Source</label>
            <select className="form-select" value={form.source} onChange={e => update('source', e.target.value)}>
              <option value="">Sélectionner</option>
              <option>LBC</option><option>SeLoger</option><option>PAP</option><option>Agence_directe</option><option>Off_market</option>
            </select>
          </div>
        </div>
        <div className="form-group"><label className="form-label">Attribuer à un client</label>
          <select className="form-select" value={form.client_attribue} onChange={e => update('client_attribue', e.target.value)}>
            <option value="">Non attribué</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Lien annonce</label><input className="form-input" value={form.lien_annonce} onChange={e => update('lien_annonce', e.target.value)} placeholder="https://..." /></div>
        <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} /></div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 'var(--space-md)' }}>
          <button className="btn btn-outline" onClick={() => setShowModal(false)}>Annuler</button>
          <button className="btn btn-gold" onClick={handleSave} disabled={saving || !form.adresse || !form.ville}>
            {saving ? <><Loader2 size={16} className="spin" /> Sauvegarde...</> : <><Save size={16} /> Créer le bien</>}
          </button>
        </div>
      </Modal>
    </div>
  );
}
