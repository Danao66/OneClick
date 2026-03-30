import { useApp } from '../../context';
import { formatCurrency, formatDate } from '../../data';
import {
  Users, Building2, DollarSign, TrendingUp, Clock, Timer,
  AlertCircle, CheckCircle2, Zap, Bell
} from 'lucide-react';

const kanbanColumns = [
  'Onboarding', 'Recherche', 'Shortlist', 'Négo', 'Financement', 'Signature', 'Travaux', 'Livré'
];

export default function AdminDashboard() {
  const { clients, biens, notificationsAdmin } = useApp();

  const activeClients = clients.filter(c => c.statut !== 'Livré').length;
  const biensEnPipeline = biens.filter(b => !['Acquis', 'Rejeté'].includes(b.statut)).length;
  const caMonth = clients.reduce((sum, c) => sum + (c.acompte_recu || 0) + (c.solde_recu || 0), 0);
  const avgMarge = clients.length > 0
    ? Math.round(clients.reduce((sum, c) => {
        const revenu = (c.honoraires || 0) + (c.commission_courtier || 0);
        const frais = c.frais_engages || 0;
        return sum + (revenu > 0 ? ((revenu - frais) / revenu) * 100 : 0);
      }, 0) / clients.length)
    : 0;
  const avgTauxHoraire = clients.filter(c => c.temps_passe_heures > 0).length > 0
    ? Math.round(clients.filter(c => c.temps_passe_heures > 0).reduce((sum, c) => {
        const revenu = (c.honoraires || 0) + (c.commission_courtier || 0) - (c.frais_engages || 0);
        return sum + revenu / c.temps_passe_heures;
      }, 0) / clients.filter(c => c.temps_passe_heures > 0).length)
    : 0;
  const deliveredClients = clients.filter(c => c.statut === 'Livré');
  const avgDelai = deliveredClients.length > 0
    ? Math.round(deliveredClients.reduce((sum, c) => {
        if (c.date_onboarding && c.date_livraison) {
          return sum + Math.ceil((new Date(c.date_livraison) - new Date(c.date_onboarding)) / (1000 * 60 * 60 * 24 * 7));
        }
        return sum;
      }, 0) / deliveredClients.length)
    : '—';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🎛️ Cockpit Admin</h1>
        <p className="page-subtitle">Vue d'ensemble de votre activité</p>
      </div>

      {/* KPIs */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        <div className="metric-card">
          <div className="metric-label"><Users size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Clients actifs</div>
          <div className="metric-value">{activeClients}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label"><Building2 size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Biens pipeline</div>
          <div className="metric-value">{biensEnPipeline}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label"><DollarSign size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> CA total</div>
          <div className="metric-value" style={{ fontSize: '1.5rem' }}>{formatCurrency(caMonth)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label"><TrendingUp size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Marge moy.</div>
          <div className="metric-value">{avgMarge}%</div>
        </div>
        <div className="metric-card">
          <div className="metric-label"><Timer size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Taux horaire</div>
          <div className="metric-value" style={{ fontSize: '1.5rem' }}>{avgTauxHoraire}€/h</div>
        </div>
        <div className="metric-card">
          <div className="metric-label"><Clock size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Délai moyen</div>
          <div className="metric-value">{avgDelai}</div>
          <div className="text-xs text-gray">semaines</div>
        </div>
      </div>

      {/* Kanban */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-header">
          <h3 className="card-title">Pipeline global</h3>
          <span className="badge badge-gray">{clients.length} clients</span>
        </div>
        <div className="kanban-board">
          {kanbanColumns.map(col => {
            const colClients = clients.filter(c => c.statut === col);
            return (
              <div key={col} className="kanban-column">
                <div className="kanban-column-header">
                  <span className="kanban-column-title">{col}</span>
                  <span className="kanban-count">{colClients.length}</span>
                </div>
                <div className="kanban-cards">
                  {colClients.map(client => {
                    const clientBiens = biens.filter(b => b.client_attribue === client.id);
                    return (
                      <div key={client.id} className="kanban-card">
                        <div className="kanban-card-title">{client.prenom} {client.nom}</div>
                        <div className="kanban-card-meta">
                          <span>{client.villes_cibles?.[0]}</span>
                          <span>{formatCurrency(client.budget_total)}</span>
                          {clientBiens.length > 0 && (
                            <span style={{ color: 'var(--gold)' }}>Score {clientBiens[0].score_base}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray" style={{ marginTop: 4 }}>
                          Depuis {formatDate(client.date_onboarding)}
                        </div>
                      </div>
                    );
                  })}
                  {colClients.length === 0 && (
                    <div className="text-sm text-gray" style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
                      Vide
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notifications admin */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title"><Bell size={20} style={{ display: 'inline', verticalAlign: 'middle' }} /> Alertes & Notifications</h3>
        </div>
        <div className="notification-list">
          {notificationsAdmin.map(notif => (
            <div key={notif.id} className="notification-item" style={{
              borderLeft: notif.urgent ? '3px solid var(--red)' : '3px solid transparent'
            }}>
              <div className={`notification-icon ${notif.urgent ? 'gold' : 'green'}`}>
                {notif.urgent ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              </div>
              <div className="notification-content">
                <div className="notification-title">{notif.message}</div>
                <div className="notification-time">{notif.date}</div>
              </div>
              {notif.urgent && <span className="badge badge-red">Urgent</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
