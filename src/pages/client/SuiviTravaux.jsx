import { useApp } from '../../context';
import { CheckCircle2, Clock, ArrowRight, Camera, CalendarDays } from 'lucide-react';

export default function SuiviTravaux() {
  const { travaux, currentClient } = useApp();

  if (!travaux || currentClient?.statut !== 'Travaux') {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">🏗️ Suivi Travaux</h1>
          <p className="page-subtitle">Le suivi de votre chantier apparaîtra ici une fois les travaux lancés.</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🏗️</div>
          <h3>Pas de chantier en cours</h3>
          <p className="text-gray">Cette section s'activera automatiquement lorsque les travaux démarreront.</p>
        </div>
      </div>
    );
  }

  const daysLeft = Math.ceil(
    (new Date(travaux.date_livraison_estimee) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🏗️ Suivi Travaux</h1>
        <p className="page-subtitle">Votre chantier en temps réel</p>
      </div>

      {/* Progress & Countdown */}
      <div className="grid-2" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h4 style={{ marginBottom: 'var(--space-md)' }}>Avancement global</h4>
          <div style={{
            width: 140, height: 140, borderRadius: '50%',
            background: `conic-gradient(var(--green) ${travaux.avancement * 3.6}deg, var(--gray-200) 0)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto'
          }}>
            <div style={{
              width: 110, height: 110, borderRadius: '50%', background: 'var(--white)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: 'var(--green)' }}>
                {travaux.avancement}%
              </span>
            </div>
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <CalendarDays size={32} color="var(--gold)" />
          <h4 style={{ marginTop: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>Livraison estimée</h4>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--gold)' }}>
            {daysLeft > 0 ? daysLeft : 0}
          </div>
          <div className="text-sm text-gray">jours restants</div>
          <div className="text-sm" style={{ marginTop: 'var(--space-xs)', fontWeight: 500 }}>
            {new Date(travaux.date_livraison_estimee).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-header">
          <h3 className="card-title">📋 Jalons du chantier</h3>
        </div>
        <div className="timeline">
          {travaux.jalons.map((jalon, i) => (
            <div key={i} className={`timeline-item ${jalon.statut === 'en_cours' ? 'active' : jalon.statut === 'terminé' ? 'completed' : ''}`}>
              <div className="timeline-item-date">
                {new Date(jalon.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </div>
              <div className="timeline-item-title">
                {jalon.statut === 'terminé' && <CheckCircle2 size={14} color="var(--green)" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />}
                {jalon.statut === 'en_cours' && <Clock size={14} color="var(--gold)" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />}
                {jalon.statut === 'a_venir' && <ArrowRight size={14} color="var(--gray-400)" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />}
                {jalon.nom}
              </div>
              <div className="timeline-item-desc">
                {jalon.statut === 'terminé' && 'Terminé'}
                {jalon.statut === 'en_cours' && 'En cours'}
                {jalon.statut === 'a_venir' && 'À venir'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Photos avant/pendant/après */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title"><Camera size={20} style={{ display: 'inline', verticalAlign: 'middle' }} /> Galerie photos</h3>
        </div>
        <div className="grid-3">
          {['Avant', 'Pendant', 'Après'].map(phase => (
            <div key={phase} style={{
              background: 'var(--gray-50)', borderRadius: 'var(--radius-md)',
              aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 8, border: '1px dashed var(--gray-300)'
            }}>
              <Camera size={24} color="var(--gray-400)" />
              <span className="text-sm text-gray">{phase}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
