import { useState } from 'react';
import { useApp } from '../../context';
import { formatCurrency, formatDate, getScoreColor, getChecklistProgress } from '../../data';
import ScoreGauge from '../../components/ScoreGauge';
import {
  Search, Filter, ChevronRight, MapPin, Ruler, Thermometer,
  CheckCircle2, X, ExternalLink, AlertTriangle, Building2
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

export default function AdminBiens() {
  const { biens, clients, setBiens } = useApp();
  const [search, setSearch] = useState('');
  const [selectedBien, setSelectedBien] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

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
    </div>
  );
}
