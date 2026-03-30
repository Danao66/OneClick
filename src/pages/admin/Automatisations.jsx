import { useApp } from '../../context';
import {
  Zap, CheckCircle2, AlertCircle, XCircle, Play, Calendar, Hash
} from 'lucide-react';

const statusColors = {
  'Actif': 'badge-green',
  'Erreur': 'badge-red',
  'Désactivé': 'badge-gray',
};

const statusIcons = {
  'Actif': CheckCircle2,
  'Erreur': AlertCircle,
  'Désactivé': XCircle,
};

export default function Automatisations() {
  const { automatisations } = useApp();

  const actifs = automatisations.filter(a => a.statut === 'Actif').length;
  const totalExec = automatisations.reduce((s, a) => s + a.nb_executions, 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⚡ Automatisations</h1>
        <p className="page-subtitle">Monitoring de tous les flux automatisés</p>
      </div>

      {/* KPIs */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 'var(--space-lg)' }}>
        <div className="metric-card">
          <div className="metric-label"><Zap size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Flux actifs</div>
          <div className="metric-value" style={{ color: 'var(--green)' }}>{actifs}/{automatisations.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label"><Play size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Exécutions totales</div>
          <div className="metric-value">{totalExec}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label"><AlertCircle size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Erreurs</div>
          <div className="metric-value" style={{ color: automatisations.filter(a => a.statut === 'Erreur').length > 0 ? 'var(--red)' : 'var(--green)' }}>
            {automatisations.filter(a => a.statut === 'Erreur').length}
          </div>
        </div>
      </div>

      {/* Automations list */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Tous les flux</h3>
        </div>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom du flux</th>
                <th>Déclencheur</th>
                <th>Actions</th>
                <th>Phase</th>
                <th>Statut</th>
                <th>Dernière exécution</th>
                <th>Exécutions</th>
              </tr>
            </thead>
            <tbody>
              {automatisations.map(auto => {
                const StatusIcon = statusIcons[auto.statut] || Zap;
                return (
                  <tr key={auto.id}>
                    <td>
                      <div className="flex items-center gap-sm">
                        <Zap size={16} color="var(--gold)" />
                        <span style={{ fontWeight: 600 }}>{auto.nom}</span>
                      </div>
                    </td>
                    <td className="text-sm">{auto.declencheur}</td>
                    <td className="text-sm" style={{ maxWidth: 250 }}>{auto.actions}</td>
                    <td><span className="badge badge-blue">{auto.phase}</span></td>
                    <td>
                      <span className={`badge ${statusColors[auto.statut]}`}>
                        <StatusIcon size={12} /> {auto.statut}
                      </span>
                    </td>
                    <td className="flex items-center gap-sm text-sm">
                      <Calendar size={12} color="var(--gray-400)" />
                      {new Date(auto.derniere_execution).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </td>
                    <td>
                      <span className="flex items-center gap-sm">
                        <Hash size={12} color="var(--gray-400)" />
                        <span style={{ fontWeight: 600 }}>{auto.nb_executions}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
