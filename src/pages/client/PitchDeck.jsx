import { useState } from 'react';
import { useApp } from '../../context';
import { formatCurrency, getScoreColor, getScoreLabel } from '../../data';
import ScoreGauge from '../../components/ScoreGauge';
import {
  CheckCircle2, AlertTriangle, MapPin, Star, Play, ChevronLeft,
  ChevronRight, TrendingUp, DollarSign, Percent, BarChart3,
  Eye, Rocket, ShieldAlert, Handshake, Building2
} from 'lucide-react';

export default function PitchDeck() {
  const { getClientBiens, currentClient, validatePitchDeck } = useApp();
  const biens = getClientBiens(currentClient?.id);
  const bien = biens.find(b => ['Shortlisté', 'Offre_envoyée'].includes(b.statut)) || biens[0];
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [validated, setValidated] = useState(false);
  const [rejected, setRejected] = useState(false);

  if (!bien) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Pitch Deck</h1>
          <p className="page-subtitle">Aucun bien à valider pour le moment.</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🔍</div>
          <h3 style={{ marginBottom: 'var(--space-sm)' }}>Recherche en cours</h3>
          <p className="text-gray">Nous analysons les meilleures opportunités pour votre profil. Vous serez notifié dès qu'un bien correspond à vos critères.</p>
        </div>
      </div>
    );
  }

  const handleValidate = () => {
    setValidated(true);
    validatePitchDeck(bien.id);
  };

  const coutTotal = (bien.prix_nego || bien.prix_affiche) + (bien.frais_notaire || 0) + (bien.honoraires_service || 0) + (bien.travaux_estimes || 0) + (bien.ameublement || 0);
  const inBudget = coutTotal <= (currentClient?.budget_total || 999999);

  // Mock photos - use colored placeholders
  const photos = bien.photos?.length > 0 ? bien.photos : [1,2,3,4,5].map(i => null);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Section 1: Verdict */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)', textAlign: 'center', padding: 'var(--space-2xl)' }}>
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <span className="badge badge-gold" style={{ fontSize: '0.85rem', padding: '6px 16px' }}>
            Executive Summary
          </span>
        </div>
        <h2 style={{ marginBottom: 'var(--space-lg)' }}>
          {bien.verdict_expert || 'Analyse du bien en cours...'}
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ScoreGauge score={bien.score_base} size={140} />
        </div>
        <div style={{ marginTop: 'var(--space-sm)' }}>
          <span className="badge" style={{
            background: `${getScoreColor(bien.score_base)}20`,
            color: getScoreColor(bien.score_base),
            fontSize: '0.9rem',
            padding: '6px 16px'
          }}>
            {getScoreLabel(bien.score_base)}
          </span>
        </div>
      </div>

      {/* Section 2: Key metrics */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="metric-card">
          <div className="metric-label"><DollarSign size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Coût total</div>
          <div className="metric-value" style={{ fontSize: '1.5rem', color: inBudget ? 'var(--green)' : 'var(--orange)' }}>
            {formatCurrency(coutTotal)}
          </div>
          <div className="text-xs text-gray">Budget max: {formatCurrency(currentClient?.budget_total)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label"><Percent size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Rendement net</div>
          <div className="metric-value" style={{ fontSize: '1.5rem' }}>{bien.rentabilite_nette}%</div>
          <div className="text-xs text-gray">Brut: {bien.rentabilite_brute}%</div>
        </div>
        <div className="metric-card">
          <div className="metric-label"><TrendingUp size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Cashflow</div>
          <div className="metric-value" style={{ fontSize: '1.5rem', color: bien.cashflow_mensuel >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {bien.cashflow_mensuel >= 0 ? '+' : ''}{formatCurrency(bien.cashflow_mensuel)}/mois
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label"><BarChart3 size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Matching</div>
          <div className="metric-value" style={{ fontSize: '1.5rem', color: 'var(--gold)' }}>{bien.matching_score}%</div>
          <div className="text-xs text-gray">{bien.statut_annonce}</div>
        </div>
      </div>

      {/* Section 3: Location & Photos */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-header">
          <h3 className="card-title"><MapPin size={20} style={{ display: 'inline', verticalAlign: 'middle' }} /> Emplacement & Visite</h3>
          <span className="badge badge-green"><Star size={12} /> Note secteur: {bien.note_secteur}/10</span>
        </div>

        <div className="grid-2" style={{ marginBottom: 'var(--space-lg)' }}>
          {/* Map placeholder */}
          <div style={{
            background: 'var(--gray-100)', borderRadius: 'var(--radius-md)',
            aspectRatio: '16/10', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 8
          }}>
            <MapPin size={32} color="var(--gray-400)" />
            <div className="text-sm text-gray">{bien.adresse}, {bien.ville}</div>
            <div className="text-xs text-gray">Carte interactive</div>
          </div>

          {/* Photo carousel */}
          <div className="photo-carousel" style={{ background: 'linear-gradient(135deg, var(--gray-100), var(--gray-200))' }}>
            <div style={{
              width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 8
            }}>
              <Building2 size={48} color="var(--gray-400)" />
              <div className="text-sm text-gray">Photo {currentPhoto + 1}/{photos.length}</div>
            </div>
            {photos.length > 1 && (
              <>
                <button className="carousel-nav prev" onClick={() => setCurrentPhoto(p => p > 0 ? p - 1 : photos.length - 1)}>
                  <ChevronLeft size={18} />
                </button>
                <button className="carousel-nav next" onClick={() => setCurrentPhoto(p => p < photos.length - 1 ? p + 1 : 0)}>
                  <ChevronRight size={18} />
                </button>
                <div className="carousel-dots">
                  {photos.map((_, i) => (
                    <button key={i} className={`carousel-dot ${i === currentPhoto ? 'active' : ''}`} onClick={() => setCurrentPhoto(i)} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quartier */}
        <div>
          <h4 style={{ marginBottom: 'var(--space-sm)' }}>Les + du quartier</h4>
          <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
            {(bien.atouts_quartier || []).map((atout, i) => (
              <span key={i} className="badge badge-green">{atout}</span>
            ))}
          </div>
        </div>

        {/* Video */}
        {bien.video_url && (
          <div style={{ marginTop: 'var(--space-lg)' }}>
            <h4 style={{ marginBottom: 'var(--space-sm)' }}><Play size={16} style={{ display:'inline', verticalAlign:'middle' }} /> Visite vidéo</h4>
            <div style={{
              background: 'var(--gray-100)', borderRadius: 'var(--radius-md)',
              aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div className="text-sm text-gray">Vidéo de visite intégrée</div>
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Montage financier */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-header">
          <h3 className="card-title">💰 Montage financier détaillé</h3>
        </div>

        <div className="grid-3" style={{ marginBottom: 'var(--space-md)' }}>
          <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)' }}>
            <h5 style={{ color: 'var(--green)', marginBottom: 'var(--space-sm)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acquisition</h5>
            <div className="flex justify-between mb-md" style={{ fontSize: '0.9rem' }}>
              <span className="text-gray">Prix négocié</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(bien.prix_nego || bien.prix_affiche)}</span>
            </div>
            <div className="flex justify-between mb-md" style={{ fontSize: '0.9rem' }}>
              <span className="text-gray">Frais notaire (~8%)</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(bien.frais_notaire)}</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: '0.9rem' }}>
              <span className="text-gray">Honoraires service</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(bien.honoraires_service)}</span>
            </div>
          </div>

          <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)' }}>
            <h5 style={{ color: 'var(--gold-dark)', marginBottom: 'var(--space-sm)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Valorisation</h5>
            <div className="flex justify-between mb-md" style={{ fontSize: '0.9rem' }}>
              <span className="text-gray">Travaux</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(bien.travaux_estimes)}</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: '0.9rem' }}>
              <span className="text-gray">Ameublement</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(bien.ameublement)}</span>
            </div>
          </div>

          <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)' }}>
            <h5 style={{ color: 'var(--blue)', marginBottom: 'var(--space-sm)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Exploitation</h5>
            <div className="flex justify-between mb-md" style={{ fontSize: '0.9rem' }}>
              <span className="text-gray">Loyer estimé</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(bien.loyer_estime)}/mois</span>
            </div>
            <div className="flex justify-between mb-md" style={{ fontSize: '0.9rem' }}>
              <span className="text-gray">Renta nette</span>
              <span style={{ fontWeight: 600, color: 'var(--green)' }}>{bien.rentabilite_nette}%</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: '0.9rem' }}>
              <span className="text-gray">Cashflow</span>
              <span style={{ fontWeight: 600, color: bien.cashflow_mensuel >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {bien.cashflow_mensuel >= 0 ? '+' : ''}{formatCurrency(bien.cashflow_mensuel)}/mois
              </span>
            </div>
          </div>
        </div>

        {/* Total */}
        <div style={{
          background: inBudget ? 'var(--green-bg)' : 'var(--orange-light)',
          borderRadius: 'var(--radius-md)', padding: 'var(--space-md)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>COÛT TOTAL PROJET</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', color: inBudget ? 'var(--green)' : 'var(--orange)' }}>
            {formatCurrency(coutTotal)}
          </span>
        </div>
      </div>

      {/* Section 5: Analyse expert */}
      <div className="grid-2" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--green)' }}>
          <h4 style={{ color: 'var(--green)', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Rocket size={20} /> Pourquoi foncer
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li className="flex items-center gap-sm"><CheckCircle2 size={16} color="var(--green)" /> Prix/m² 17% sous le marché local</li>
            <li className="flex items-center gap-sm"><CheckCircle2 size={16} color="var(--green)" /> Cashflow positif dès le premier mois</li>
            <li className="flex items-center gap-sm"><CheckCircle2 size={16} color="var(--green)" /> Quartier en gentrification (projet Manufacture)</li>
            <li className="flex items-center gap-sm"><CheckCircle2 size={16} color="var(--green)" /> Vendeur pressé = forte marge de négociation</li>
          </ul>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--orange)' }}>
          <h4 style={{ color: 'var(--orange)', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={20} /> Point de vigilance
          </h4>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <AlertTriangle size={16} color="var(--orange)" style={{ marginTop: 3, flexShrink: 0 }} />
            <div>
              <p style={{ marginBottom: 'var(--space-xs)' }}><strong>DPE D</strong> — Passoire énergétique intermédiaire. Travaux d'isolation prévus dans le budget (12 000€) pour passer en C ou B.</p>
              <p className="text-sm text-gray" style={{ marginBottom: 0 }}>→ Ce point est intégralement couvert par le budget travaux et améliorera la valeur du bien.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 6: Stratégie négo */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-header">
          <h3 className="card-title"><Handshake size={20} style={{ display: 'inline', verticalAlign: 'middle' }} /> Stratégie de négociation</h3>
        </div>
        <p>
          Offre agressive à <strong>{formatCurrency(bien.prix_nego)}</strong> (vs {formatCurrency(bien.prix_affiche)} affiché), soit une remise de <strong>{Math.round(((bien.prix_affiche - (bien.prix_nego || bien.prix_affiche)) / bien.prix_affiche) * 100)}%</strong>.
        </p>
        <p>Justification : vendeur en situation de divorce, bien sur le marché depuis {bien.statut_annonce?.includes('jours') ? bien.statut_annonce.toLowerCase() : '45 jours'}. Comparables DVF dans le quartier entre 1 400€ et 1 600€/m².</p>
        <div style={{
          background: 'rgba(200,169,110,0.08)', borderRadius: 'var(--radius-md)',
          padding: 'var(--space-md)', marginTop: 'var(--space-md)',
          borderLeft: '3px solid var(--gold)'
        }}>
          <p style={{ fontStyle: 'italic', color: 'var(--gold-dark)', marginBottom: 0, fontWeight: 500 }}>
            « Ma prestation s'autofinance par la remise obtenue sur le prix d'achat. »
          </p>
        </div>
      </div>

      {/* Section 7: Decision */}
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
        <h3 style={{ marginBottom: 'var(--space-lg)' }}>Votre décision</h3>

        {validated ? (
          <div style={{ background: 'var(--green-bg)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)' }}>
            <CheckCircle2 size={48} color="var(--green)" />
            <h3 style={{ color: 'var(--green)', marginTop: 'var(--space-md)' }}>Offre validée ! 🎉</h3>
            <p className="text-gray">Votre expert a été notifié et lance immédiatement la négociation.</p>
          </div>
        ) : rejected ? (
          <div style={{ background: 'var(--red-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)' }}>
            <AlertTriangle size={48} color="var(--red)" />
            <h3 style={{ color: 'var(--red)', marginTop: 'var(--space-md)' }}>Bien refusé</h3>
            <p className="text-gray">Nous continuons la recherche pour vous. Vous serez notifié dès la prochaine opportunité.</p>
          </div>
        ) : (
          <>
            <div className="flex gap-lg" style={{ justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'var(--space-lg)' }}>
              <button className="btn btn-primary btn-xl" onClick={handleValidate} style={{ minWidth: 260 }}>
                🟢 OUI, je valide l'offre à {formatCurrency(bien.prix_nego || bien.prix_affiche)}
              </button>
              <button className="btn btn-danger btn-xl" onClick={() => setRejected(true)} style={{ minWidth: 200 }}>
                🔴 NON, je passe
              </button>
            </div>
            <p className="text-sm text-gray" style={{ marginBottom: 0 }}>
              <Eye size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {Math.floor(Math.random() * 15) + 8} vues sur des biens similaires cette semaine
            </p>
          </>
        )}
      </div>
    </div>
  );
}
