import { useApp } from '../../context';
import { formatCurrency } from '../../data';
import {
  DollarSign, TrendingUp, Users, AlertCircle, Trophy, Target
} from 'lucide-react';

export default function SuiviFinancier() {
  const { clients } = useApp();

  const clientsWithFinance = clients.map(c => {
    const revenuTotal = (c.honoraires || 0) + (c.commission_courtier || 0);
    const margeNette = revenuTotal - (c.frais_engages || 0);
    const tauxHoraire = c.temps_passe_heures > 0 ? Math.round(margeNette / c.temps_passe_heures) : 0;
    return { ...c, revenuTotal, margeNette, tauxHoraire };
  });

  const totalCA = clientsWithFinance.reduce((s, c) => s + c.revenuTotal, 0);
  const totalMarge = clientsWithFinance.reduce((s, c) => s + c.margeNette, 0);
  const avgMarge = clientsWithFinance.length > 0
    ? Math.round(clientsWithFinance.reduce((s, c) => s + (c.revenuTotal > 0 ? (c.margeNette / c.revenuTotal) * 100 : 0), 0) / clientsWithFinance.length)
    : 0;
  const livrees = clientsWithFinance.filter(c => c.statut === 'Livré').length;
  const impayesCount = clientsWithFinance.filter(c => c.statut_paiement === 'Impayé').length;
  const tauxHoraires = clientsWithFinance.filter(c => c.tauxHoraire > 0).map(c => c.tauxHoraire);
  const bestTH = tauxHoraires.length > 0 ? Math.max(...tauxHoraires) : 0;
  const worstTH = tauxHoraires.length > 0 ? Math.min(...tauxHoraires) : 0;
  const lowTH = clientsWithFinance.filter(c => c.tauxHoraire > 0 && c.tauxHoraire < 50);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">💰 Suivi Financier</h1>
        <p className="page-subtitle">Performance financière globale et par client</p>
      </div>

      {/* Dashboard KPIs */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: 'var(--space-lg)' }}>
        <div className="metric-card">
          <div className="metric-label"><DollarSign size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> CA total</div>
          <div className="metric-value" style={{ fontSize: '1.5rem' }}>{formatCurrency(totalCA)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label"><TrendingUp size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Marge totale</div>
          <div className="metric-value" style={{ fontSize: '1.5rem', color: 'var(--green)' }}>{formatCurrency(totalMarge)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Marge moy.</div>
          <div className="metric-value">{avgMarge}%</div>
        </div>
        <div className="metric-card">
          <div className="metric-label"><Users size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Missions livrées</div>
          <div className="metric-value">{livrees}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label"><Trophy size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Meilleur TH</div>
          <div className="metric-value" style={{ color: 'var(--green)' }}>{bestTH}€/h</div>
        </div>
        <div className="metric-card">
          <div className="metric-label"><Target size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Pire TH</div>
          <div className="metric-value" style={{ color: worstTH < 50 ? 'var(--red)' : 'var(--green)' }}>{worstTH}€/h</div>
        </div>
      </div>

      {/* Alerts */}
      {(impayesCount > 0 || lowTH.length > 0) && (
        <div className="card" style={{ marginBottom: 'var(--space-lg)', borderLeft: '4px solid var(--red)' }}>
          <h4 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--red)' }}>
            <AlertCircle size={18} /> Alertes financières
          </h4>
          {impayesCount > 0 && (
            <div className="notification-item" style={{ background: 'var(--red-light)', marginBottom: 8 }}>
              <div className="notification-content">
                <div className="notification-title">{impayesCount} impayé(s) détecté(s)</div>
                <div className="notification-time">Action requise</div>
              </div>
            </div>
          )}
          {lowTH.map(c => (
            <div key={c.id} className="notification-item" style={{ background: 'var(--orange-light)', marginBottom: 8 }}>
              <div className="notification-content">
                <div className="notification-title">Taux horaire bas : {c.prenom} {c.nom} — {c.tauxHoraire}€/h</div>
                <div className="notification-time">Inférieur au seuil de 50€/h</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table par client */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Détail par client</h3>
        </div>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th><th>Honoraires</th><th>Acompte</th><th>Solde</th>
                <th>Commission</th><th>Frais</th><th>Revenu total</th><th>Marge nette</th>
                <th>Heures</th><th>Taux horaire</th>
              </tr>
            </thead>
            <tbody>
              {clientsWithFinance.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.prenom} {c.nom}</div>
                    <div className="text-xs text-gray">{c.statut}</div>
                  </td>
                  <td>{formatCurrency(c.honoraires)}</td>
                  <td>{formatCurrency(c.acompte_recu)}</td>
                  <td>{formatCurrency(c.solde_recu)}</td>
                  <td>{formatCurrency(c.commission_courtier)}</td>
                  <td style={{ color: 'var(--red)' }}>{formatCurrency(c.frais_engages)}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(c.revenuTotal)}</td>
                  <td style={{ fontWeight: 600, color: c.margeNette >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {formatCurrency(c.margeNette)}
                  </td>
                  <td>{c.temps_passe_heures}h</td>
                  <td>
                    <span style={{
                      fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)',
                      background: c.tauxHoraire < 50 ? 'var(--red-light)' : 'var(--green-bg)',
                      color: c.tauxHoraire < 50 ? 'var(--red)' : 'var(--green)',
                    }}>
                      {c.tauxHoraire}€/h
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
