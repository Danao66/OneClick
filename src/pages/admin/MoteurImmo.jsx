import { useState } from 'react';
import { useApp } from '../../context';
import { formatCurrency, getScoreColor, calculateScoreBASE } from '../../data';
import {
  Upload, Filter, AlertTriangle, Plus, ArrowUpDown, Eye, EyeOff
} from 'lucide-react';

const defaultImports = [
  { titre: 'T3 Centre-ville Rennes', url: 'https://lbc.fr/rennes-t3', ville: 'Rennes', surface: 55, prix: 115000, prixM2: 2091, ecartMarche: -38, charges: 60, tf: 700, dpe: 'D', loyerEstime: 580, rentaBrute: 6.05, redFlag: false, scoreBASE: 74, decision: '' },
  { titre: 'Studio meublé Nantes', url: 'https://seloger.com/nantes-studio', ville: 'Nantes', surface: 22, prix: 72000, prixM2: 3273, ecartMarche: 2, charges: 35, tf: 380, dpe: 'C', loyerEstime: 420, rentaBrute: 7.0, redFlag: false, scoreBASE: 68, decision: '' },
  { titre: 'T2 quartier gare Lille', url: 'https://lbc.fr/lille-t2', ville: 'Lille', surface: 40, prix: 98000, prixM2: 2450, ecartMarche: -18, charges: 70, tf: 620, dpe: 'E', loyerEstime: 520, rentaBrute: 6.37, redFlag: false, scoreBASE: 65, decision: '' },
  { titre: 'T4 à rénover Stéfanois', url: 'https://lbc.fr/se-t4', ville: 'Saint-Étienne', surface: 78, prix: 62000, prixM2: 795, ecartMarche: -56, charges: 110, tf: 480, dpe: 'F', loyerEstime: 550, rentaBrute: 10.65, redFlag: true, scoreBASE: 52, decision: '' },
  { titre: 'T2 Chartrons Bordeaux', url: 'https://seloger.com/bordeaux-t2', ville: 'Bordeaux', surface: 38, prix: 175000, prixM2: 4605, ecartMarche: 10, charges: 55, tf: 850, dpe: 'B', loyerEstime: 680, rentaBrute: 4.66, redFlag: false, scoreBASE: 58, decision: '' },
  { titre: 'Studio Montpellier Écusson', url: 'https://pap.fr/mtp-studio', ville: 'Montpellier', surface: 25, prix: 85000, prixM2: 3400, ecartMarche: 10, charges: 120, tf: 420, dpe: 'G', loyerEstime: 480, rentaBrute: 6.78, redFlag: true, scoreBASE: 35, decision: '' },
];

export default function MoteurImmo() {
  const { setBiens, biens } = useApp();
  const [data, setData] = useState(defaultImports);
  const [hideRedFlags, setHideRedFlags] = useState(false);
  const [sortBy, setSortBy] = useState('rentaBrute');
  const [sortDesc, setSortDesc] = useState(true);
  const [minSurface, setMinSurface] = useState(0);
  const [maxSurface, setMaxSurface] = useState(999);

  const filtered = data
    .filter(d => !hideRedFlags || !d.redFlag)
    .filter(d => d.surface >= minSurface && d.surface <= maxSurface)
    .sort((a, b) => sortDesc ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]);

  const handleSort = (col) => {
    if (sortBy === col) setSortDesc(!sortDesc);
    else { setSortBy(col); setSortDesc(true); }
  };

  const addToPipeline = (item) => {
    const newBien = {
      id: 'b' + (biens.length + 1 + Math.floor(Math.random() * 100)),
      adresse: item.titre,
      ville: item.ville,
      surface_m2: item.surface,
      prix_affiche: item.prix,
      prix_m2: item.prixM2,
      dpe: item.dpe,
      charges_copro: item.charges,
      taxe_fonciere: item.tf,
      loyer_estime: item.loyerEstime,
      rentabilite_brute: item.rentaBrute,
      rentabilite_nette: Math.max(0, item.rentaBrute - 1.5),
      cashflow_mensuel: Math.round(item.loyerEstime - (item.charges + item.tf / 12) - item.prix * 0.003),
      travaux_estimes: 0,
      ameublement: 0,
      score_base: item.scoreBASE,
      statut: 'Identifié',
      source: 'Moteur_Immo',
      lien_annonce: item.url,
      photos: [],
      video_url: '',
      date_sourcing: new Date().toISOString().slice(0, 10),
      client_attribue: null,
      agence: null,
      checklist_vendeur: {},
      notes: `Importé depuis Moteur Immo. Écart marché: ${item.ecartMarche}%`,
      verdict_expert: '',
      note_secteur: 6,
      atouts_quartier: [],
    };
    setBiens(prev => [...prev, newBien]);
    setData(prev => prev.map(d => d.titre === item.titre ? { ...d, decision: 'pipeline' } : d));
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <h1 className="page-title">🧮 Moteur Immo</h1>
            <p className="page-subtitle">Analyse mathématique des opportunités</p>
          </div>
          <button className="btn btn-outline">
            <Upload size={16} /> Importer CSV/Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="flex gap-md items-center" style={{ flexWrap: 'wrap' }}>
          <div className="flex items-center gap-sm">
            <Filter size={16} color="var(--gray-500)" />
            <span className="text-sm" style={{ fontWeight: 600 }}>Filtres :</span>
          </div>
          <div className="flex items-center gap-sm">
            <label className="text-sm text-gray">Surface min:</label>
            <input className="form-input" type="number" value={minSurface || ''} onChange={e => setMinSurface(parseInt(e.target.value) || 0)} style={{ width: 70, padding: '4px 8px' }} placeholder="0" />
          </div>
          <div className="flex items-center gap-sm">
            <label className="text-sm text-gray">Surface max:</label>
            <input className="form-input" type="number" value={maxSurface >= 999 ? '' : maxSurface} onChange={e => setMaxSurface(parseInt(e.target.value) || 999)} style={{ width: 70, padding: '4px 8px' }} placeholder="∞" />
          </div>
          <button
            className={`btn btn-sm ${hideRedFlags ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setHideRedFlags(!hideRedFlags)}
          >
            {hideRedFlags ? <EyeOff size={14} /> : <Eye size={14} />}
            {hideRedFlags ? 'Red flags masqués' : 'Masquer red flags'}
          </button>
          <span className="text-sm text-gray">{filtered.length} résultats</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Ville</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('surface')}>
                <span className="flex items-center gap-sm">Surface <ArrowUpDown size={12} /></span>
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('prix')}>
                <span className="flex items-center gap-sm">Prix <ArrowUpDown size={12} /></span>
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('prixM2')}>
                <span className="flex items-center gap-sm">€/m² <ArrowUpDown size={12} /></span>
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('ecartMarche')}>
                <span className="flex items-center gap-sm">Écart marché <ArrowUpDown size={12} /></span>
              </th>
              <th>Charges</th>
              <th>TF</th>
              <th>DPE</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('loyerEstime')}>
                <span className="flex items-center gap-sm">Loyer <ArrowUpDown size={12} /></span>
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('rentaBrute')}>
                <span className="flex items-center gap-sm">Renta <ArrowUpDown size={12} /></span>
              </th>
              <th>Red Flag</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('scoreBASE')}>
                <span className="flex items-center gap-sm">Score <ArrowUpDown size={12} /></span>
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => (
              <tr key={i} style={{ background: item.redFlag ? 'rgba(192,57,43,0.03)' : undefined }}>
                <td>
                  <a href={item.url} target="_blank" rel="noreferrer" style={{ fontWeight: 600 }}>
                    {item.titre}
                  </a>
                </td>
                <td>{item.ville}</td>
                <td>{item.surface} m²</td>
                <td>{formatCurrency(item.prix)}</td>
                <td>{formatCurrency(item.prixM2)}</td>
                <td>
                  <span style={{ fontWeight: 600, color: item.ecartMarche < 0 ? 'var(--green)' : item.ecartMarche > 5 ? 'var(--red)' : 'var(--gray-600)' }}>
                    {item.ecartMarche > 0 ? '+' : ''}{item.ecartMarche}%
                  </span>
                </td>
                <td>{item.charges}€</td>
                <td>{formatCurrency(item.tf)}</td>
                <td>
                  <span className={`badge ${['F','G'].includes(item.dpe) ? 'badge-red' : item.dpe === 'E' ? 'badge-orange' : 'badge-green'}`}>
                    {item.dpe}
                  </span>
                </td>
                <td>{formatCurrency(item.loyerEstime)}</td>
                <td>
                  <span style={{ fontWeight: 700, color: item.rentaBrute >= 7 ? 'var(--green)' : item.rentaBrute >= 5 ? 'var(--gold)' : 'var(--red)' }}>
                    {item.rentaBrute}%
                  </span>
                </td>
                <td>
                  {item.redFlag ? (
                    <span className="badge badge-red"><AlertTriangle size={10} /> Flag</span>
                  ) : (
                    <span className="text-sm text-gray">—</span>
                  )}
                </td>
                <td>
                  <span style={{ fontWeight: 700, color: getScoreColor(item.scoreBASE) }}>
                    {item.scoreBASE}
                  </span>
                </td>
                <td>
                  {item.decision === 'pipeline' ? (
                    <span className="badge badge-green">✓ Pipeline</span>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => addToPipeline(item)}>
                      <Plus size={14} /> Pipeline
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
