import { useState } from 'react';
import { useApp } from '../../context';
import { formatDate } from '../../data';
import {
  Search, Building2, Phone, Mail, ChevronRight, BarChart3
} from 'lucide-react';

const statusColors = {
  'Contactee': 'badge-gray', 'Interessee': 'badge-blue',
  'RDV_planifie': 'badge-gold', 'Partenaire_actif': 'badge-green', 'Non_interessee': 'badge-red',
};

const statusLabels = {
  'Contactee': 'Contactée', 'Interessee': 'Intéressée',
  'RDV_planifie': 'RDV planifié', 'Partenaire_actif': 'Partenaire actif', 'Non_interessee': 'Non intéressée',
};

export default function AdminAgences() {
  const { agences } = useApp();
  const [search, setSearch] = useState('');
  const [view, setView] = useState('table'); // table | kanban

  const filtered = agences.filter(a =>
    `${a.nom} ${a.ville} ${a.contact_principal}`.toLowerCase().includes(search.toLowerCase())
  );

  const kanbanStatuts = ['Contactee', 'Interessee', 'RDV_planifie', 'Partenaire_actif', 'Non_interessee'];

  return (
    <div>
      <div className="page-header">
        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <h1 className="page-title">🤝 Base Agences</h1>
            <p className="page-subtitle">{agences.length} agences partenaires</p>
          </div>
          <div className="flex gap-sm">
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input className="form-input" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36, width: 220 }} />
            </div>
            <div className="flex gap-sm">
              <button className={`btn ${view === 'table' ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setView('table')}>Table</button>
              <button className={`btn ${view === 'kanban' ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setView('kanban')}>Kanban</button>
            </div>
          </div>
        </div>
      </div>

      {view === 'table' ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Agence</th><th>Ville</th><th>Contact</th><th>Statut</th>
                <th>Biens envoyés</th><th>Deals conclus</th><th>Score</th><th>Dernière interaction</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(agence => (
                <tr key={agence.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div className="flex items-center gap-sm">
                      <div style={{
                        width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                        background: 'var(--green-bg)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: 'var(--green)', flexShrink: 0
                      }}>
                        <Building2 size={16} />
                      </div>
                      {agence.nom}
                    </div>
                  </td>
                  <td>{agence.ville}</td>
                  <td>
                    <div>{agence.contact_principal}</div>
                    <div className="text-xs text-gray">{agence.email}</div>
                  </td>
                  <td><span className={`badge ${statusColors[agence.statut] || 'badge-gray'}`}>{statusLabels[agence.statut] || agence.statut}</span></td>
                  <td style={{ textAlign: 'center' }}>{agence.nb_biens_envoyes}</td>
                  <td style={{ textAlign: 'center' }}>{agence.nb_deals_conclus}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: agence.score_agence >= 80 ? 'var(--green)' : agence.score_agence >= 50 ? 'var(--gold)' : 'var(--gray-500)' }}>
                      {agence.score_agence || '—'}
                    </span>
                  </td>
                  <td>{formatDate(agence.derniere_interaction)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="kanban-board">
          {kanbanStatuts.map(statut => {
            const colAgences = filtered.filter(a => a.statut === statut);
            return (
              <div key={statut} className="kanban-column">
                <div className="kanban-column-header">
                  <span className="kanban-column-title">{statusLabels[statut]}</span>
                  <span className="kanban-count">{colAgences.length}</span>
                </div>
                <div className="kanban-cards">
                  {colAgences.map(agence => (
                    <div key={agence.id} className="kanban-card">
                      <div className="kanban-card-title">{agence.nom}</div>
                      <div className="kanban-card-meta">
                        <span>{agence.ville}</span>
                        <span>{agence.contact_principal}</span>
                      </div>
                      <div className="text-xs text-gray" style={{ marginTop: 4 }}>
                        {agence.nb_biens_envoyes} biens • {agence.nb_deals_conclus} deals
                      </div>
                    </div>
                  ))}
                  {colAgences.length === 0 && (
                    <div className="text-sm text-gray" style={{ textAlign: 'center', padding: 'var(--space-md)' }}>Vide</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
