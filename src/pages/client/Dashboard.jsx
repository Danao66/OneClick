import { useApp } from '../../context';
import { formatCurrency, formatDate } from '../../data';
import ScoreGauge from '../../components/ScoreGauge';
import {
  Phone, Mail, Calendar, MapPin, Target, TrendingUp, Building2,
  CheckCircle2, Clock, ArrowRight, Bell, Eye
} from 'lucide-react';

export default function ClientDashboard() {
  const { currentClient, getClientBiens, notificationsClient } = useApp();
  const clientBiens = getClientBiens(currentClient?.id);

  if (!currentClient) return <div>Chargement...</div>;

  const pipelineSteps = [
    { label: 'Stratégie & Légal', status: 'completed' },
    { label: 'Chasse terrain', status: currentClient.statut === 'Recherche' ? 'active' : 'completed', count: '24 biens analysés' },
    { label: 'Dossiers à valider', status: ['Shortlist', 'Négo'].includes(currentClient.statut) ? 'active' : currentClient.statut === 'Recherche' ? 'upcoming' : 'completed', count: clientBiens.length + ' bien(s)' },
    { label: 'Acquisition', status: ['Financement', 'Signature', 'Travaux', 'Livré'].includes(currentClient.statut) ? 'active' : 'upcoming' },
  ];

  return (
    <div>
      {/* Welcome */}
      <div className="page-header">
        <h1 style={{ marginBottom: 4 }}>
          Bienvenue {currentClient.prenom}. <span style={{ color: 'var(--gold)' }}>Votre projet avance.</span>
        </h1>
        <p className="page-subtitle">
          Voici votre tableau de bord personnalisé. Tout est sous contrôle.
        </p>
      </div>

      {/* Bloc 1: Contacts */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-header">
          <h3 className="card-title">Votre expert dédié</h3>
        </div>
        <div className="flex items-center gap-lg" style={{ flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--green), var(--green-light))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700
            }}>
              LM
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1rem' }}>Ludo — Coach Immobilier</div>
              <div className="text-sm text-gray">Votre interlocuteur unique</div>
            </div>
          </div>
          <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
            <a href="tel:+33612345678" className="btn btn-outline btn-sm">
              <Phone size={16} /> Appeler
            </a>
            <a href="mailto:contact@cleenmain.fr" className="btn btn-outline btn-sm">
              <Mail size={16} /> Email
            </a>
            <a href="https://calendly.com" target="_blank" rel="noreferrer" className="btn btn-gold btn-sm">
              <Calendar size={16} /> Planifier un appel
            </a>
          </div>
        </div>
      </div>

      {/* Bloc 2: Boussole du projet */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-header">
          <h3 className="card-title">🧭 Boussole du projet</h3>
          <span className="badge badge-green">Stratégie validée le {formatDate(currentClient.date_onboarding)}</span>
        </div>
        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          <table className="data-table">
            <tbody>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--gray-500)', width: '30%' }}>
                  <span className="flex items-center gap-sm"><Target size={16} /> Budget maximum</span>
                </td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(currentClient.budget_total)}</td>
                <td style={{ fontWeight: 600, color: 'var(--gray-500)' }}>
                  <span className="flex items-center gap-sm"><TrendingUp size={16} /> Rendement visé</span>
                </td>
                <td style={{ fontWeight: 600 }}>{currentClient.rendement_cible}% net</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--gray-500)' }}>
                  <span className="flex items-center gap-sm"><MapPin size={16} /> Ville(s)</span>
                </td>
                <td style={{ fontWeight: 600 }}>{currentClient.villes_cibles?.join(', ')}</td>
                <td style={{ fontWeight: 600, color: 'var(--gray-500)' }}>
                  <span className="flex items-center gap-sm"><Building2 size={16} /> Type de bien</span>
                </td>
                <td style={{ fontWeight: 600 }}>{currentClient.type_bien?.join(', ')}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--gray-500)' }}>Apport</td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(currentClient.apport_disponible)}</td>
                <td style={{ fontWeight: 600, color: 'var(--gray-500)' }}>Stratégie</td>
                <td style={{ fontWeight: 600 }}>{currentClient.objectif} — {currentClient.regime_fiscal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bloc 3: Pipeline */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-header">
          <h3 className="card-title">📊 Suivi en temps réel</h3>
        </div>
        <div className="pipeline-steps">
          {pipelineSteps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && <div className={`pipeline-connector ${step.status === 'completed' || pipelineSteps[i-1].status === 'completed' ? 'completed' : ''}`} />}
              <div className={`pipeline-step ${step.status}`}>
                {step.status === 'completed' && <CheckCircle2 size={18} />}
                {step.status === 'active' && <Clock size={18} />}
                {step.status === 'upcoming' && <ArrowRight size={18} />}
                <div>
                  <div>{step.label}</div>
                  {step.count && step.status !== 'upcoming' && (
                    <div className="text-xs text-gray">{step.count}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bloc 4: Notifications */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🔔 Notifications récentes</h3>
        </div>
        <div className="notification-list">
          {notificationsClient.map(notif => (
            <div key={notif.id} className="notification-item">
              <div className={`notification-icon ${notif.icon}`}>
                {notif.icon === 'green' && <CheckCircle2 size={18} />}
                {notif.icon === 'gold' && <Bell size={18} />}
                {notif.icon === 'blue' && <Eye size={18} />}
              </div>
              <div className="notification-content">
                <div className="notification-title">{notif.message}</div>
                <div className="notification-time">{formatDate(notif.date)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
