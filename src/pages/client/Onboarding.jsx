import { useState } from 'react';
import { useApp } from '../../context';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, ArrowRight, ArrowLeft, User, Target, Home, AlertTriangle, Loader2 } from 'lucide-react';

const steps = [
  { title: 'Profil investisseur', icon: User },
  { title: 'Objectifs patrimoniaux', icon: Target },
  { title: 'Critères du bien', icon: Home },
  { title: 'Contraintes', icon: AlertTriangle },
];

export default function Onboarding() {
  const { addClient } = useApp();
  const { user } = useAuth();
  const meta = user?.user_metadata || {};

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [form, setForm] = useState({
    prenom: meta.prenom || '', nom: meta.nom || '', email: user?.email || '',
    telephone: '', ville_residence: '',
    situation_pro: '', revenus_mensuels: '', experience_immo: '', credits_en_cours: '',
    objectif: '', horizon: '', rendement_cible: '', tolerance_risque: '', regime_fiscal: '',
    budget_total: '', apport_disponible: '', type_bien: [], villes_cibles: '',
    ouvert_autres_villes: '', dpe_minimum: '', tolerance_travaux: '', copro: '', type_location: [],
    criteres_redhibitoires: [], gestion_locative: '', delai_souhaite: '', source_acquisition: '', commentaires: '',
  });

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const toggleArray = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value]
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await addClient({
        ...form,
        user_id: user?.id || null,
        villes_cibles: form.villes_cibles.split(',').map(v => v.trim()).filter(Boolean),
        apport_disponible: parseInt(form.apport_disponible) || 0,
        budget_total: parseInt(form.budget_total) || 0,
        rendement_cible: parseFloat(form.rendement_cible) || 0,
      });
      setSubmitted(true);
    } catch (err) {
      setSaveError('Une erreur est survenue. Veuillez réessayer.');
      console.error('Onboarding save error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', paddingTop: 'var(--space-3xl)' }}>
        <div className="card" style={{ padding: 'var(--space-2xl)' }}>
          <CheckCircle2 size={64} color="var(--green)" style={{ marginBottom: 'var(--space-md)' }} />
          <h2 style={{ color: 'var(--green)', marginBottom: 'var(--space-md)' }}>Onboarding complété !</h2>
          <p className="text-gray">Votre cahier des charges a été transmis à votre expert. Vous serez recontacté sous 24h pour valider votre stratégie d'investissement.</p>
          <p style={{ marginTop: 'var(--space-lg)' }}>
            <span className="badge badge-gold" style={{ fontSize: '0.9rem', padding: '8px 20px' }}>
              Score profil calculé automatiquement
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">📋 Onboarding Investisseur</h1>
        <p className="page-subtitle">Remplissez votre profil pour que nous puissions trouver le bien idéal.</p>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 'var(--space-xl)' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 'var(--radius-md)',
              background: i === step ? 'var(--green)' : i < step ? 'var(--green-bg)' : 'var(--gray-50)',
              color: i === step ? 'white' : i < step ? 'var(--green)' : 'var(--gray-400)',
              fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.3s'
            }}>
              {i < step ? <CheckCircle2 size={16} /> : <s.icon size={16} />}
              <span className="hide-mobile">{s.title}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? 'var(--green)' : 'var(--gray-200)', margin: '0 4px' }} />}
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 'var(--space-xl)' }}>
        {/* Step 1 */}
        {step === 0 && (
          <div>
            <h3 style={{ marginBottom: 'var(--space-lg)' }}>Profil investisseur</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Prénom *</label>
                <input className="form-input" value={form.prenom} onChange={e => update('prenom', e.target.value)} placeholder="Votre prénom" />
              </div>
              <div className="form-group">
                <label className="form-label">Nom *</label>
                <input className="form-input" value={form.nom} onChange={e => update('nom', e.target.value)} placeholder="Votre nom" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="email@exemple.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Téléphone *</label>
                <input className="form-input" type="tel" value={form.telephone} onChange={e => update('telephone', e.target.value)} placeholder="+33 6 12 34 56 78" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Ville de résidence *</label>
              <input className="form-input" value={form.ville_residence} onChange={e => update('ville_residence', e.target.value)} placeholder="Paris, Lyon, Marseille..." />
            </div>
            <div className="form-group">
              <label className="form-label">Situation professionnelle</label>
              <select className="form-select" value={form.situation_pro} onChange={e => update('situation_pro', e.target.value)}>
                <option value="">Sélectionner</option>
                <option>CDI</option><option>CDD</option><option>Fonctionnaire</option>
                <option>Indépendant</option><option>Chef d'entreprise</option>
                <option>Libéral</option><option>Retraité</option><option>Autre</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Revenus nets mensuels foyer</label>
              <select className="form-select" value={form.revenus_mensuels} onChange={e => update('revenus_mensuels', e.target.value)}>
                <option value="">Sélectionner</option>
                <option value="<2500">Moins de 2 500€</option>
                <option value="2500-4000">2 500€ — 4 000€</option>
                <option value="4000-6000">4 000€ — 6 000€</option>
                <option value="6000-10000">6 000€ — 10 000€</option>
                <option value=">10000">Plus de 10 000€</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Expérience immobilière</label>
              <div className="form-radio-group">
                {['1er investissement', '1 bien', '2-5 biens', '5+ biens'].map(opt => (
                  <label key={opt} className={`form-radio-option ${form.experience_immo === opt ? 'selected' : ''}`}>
                    <input type="radio" name="exp" value={opt} checked={form.experience_immo === opt} onChange={() => update('experience_immo', opt)} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Crédits en cours (hors RP)</label>
              <select className="form-select" value={form.credits_en_cours} onChange={e => update('credits_en_cours', e.target.value)}>
                <option value="">Sélectionner</option>
                <option>Aucun</option><option>1</option><option>2-3</option><option>4+</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <div>
            <h3 style={{ marginBottom: 'var(--space-lg)' }}>Objectifs patrimoniaux</h3>
            <div className="form-group">
              <label className="form-label">Objectif principal</label>
              <select className="form-select" value={form.objectif} onChange={e => update('objectif', e.target.value)}>
                <option value="">Sélectionner</option>
                <option>Rendement</option><option>Patrimoine</option><option>Défiscalisation</option>
                <option>Retraite</option><option>Diversification</option><option>Mixte</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Horizon d'investissement</label>
              <select className="form-select" value={form.horizon} onChange={e => update('horizon', e.target.value)}>
                <option value="">Sélectionner</option>
                <option value="Court <5ans">Court terme (moins de 5 ans)</option>
                <option value="Moyen 5-15">Moyen terme (5 à 15 ans)</option>
                <option value="Long 15+">Long terme (15+ ans)</option>
                <option>Indéterminé</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Rendement net minimum visé</label>
              <select className="form-select" value={form.rendement_cible} onChange={e => update('rendement_cible', e.target.value)}>
                <option value="">Sélectionner</option>
                <option value="5">Moins de 5%</option>
                <option value="6">5% — 7%</option>
                <option value="8.5">7% — 10%</option>
                <option value="10">Plus de 10%</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tolérance au risque</label>
              <div className="form-radio-group">
                {['Prudent', 'Modéré', 'Dynamique'].map(opt => (
                  <label key={opt} className={`form-radio-option ${form.tolerance_risque === opt ? 'selected' : ''}`}>
                    <input type="radio" name="risque" value={opt} checked={form.tolerance_risque === opt} onChange={() => update('tolerance_risque', opt)} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Régime fiscal envisagé</label>
              <select className="form-select" value={form.regime_fiscal} onChange={e => update('regime_fiscal', e.target.value)}>
                <option value="">Sélectionner</option>
                <option>LMNP</option><option>Nu</option><option>SCI IS</option>
                <option value="A_definir">Je ne sais pas</option><option>Autre</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 2 && (
          <div>
            <h3 style={{ marginBottom: 'var(--space-lg)' }}>Critères du bien</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Budget total</label>
                <select className="form-select" value={form.budget_total} onChange={e => update('budget_total', e.target.value)}>
                  <option value="">Sélectionner</option>
                  <option value="80000">Moins de 80 000€</option>
                  <option value="120000">80 000€ — 120 000€</option>
                  <option value="180000">120 000€ — 180 000€</option>
                  <option value="250000">180 000€ — 250 000€</option>
                  <option value="400000">250 000€ — 400 000€</option>
                  <option value="500000">Plus de 400 000€</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Apport disponible</label>
                <select className="form-select" value={form.apport_disponible} onChange={e => update('apport_disponible', e.target.value)}>
                  <option value="">Sélectionner</option>
                  <option value="0">0€</option>
                  <option value="10000">Moins de 10 000€</option>
                  <option value="25000">10 000€ — 25 000€</option>
                  <option value="50000">25 000€ — 50 000€</option>
                  <option value="75000">Plus de 50 000€</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Type de bien (multi-sélection)</label>
              <div className="form-checkbox-group">
                {['Studio', 'T2', 'T3', 'T4+', 'Immeuble', 'Local', 'Parking'].map(opt => (
                  <label key={opt} className={`form-checkbox-option ${form.type_bien.includes(opt) ? 'selected' : ''}`}>
                    <input type="checkbox" checked={form.type_bien.includes(opt)} onChange={() => toggleArray('type_bien', opt)} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Villes / zones cibles</label>
              <textarea className="form-textarea" value={form.villes_cibles} onChange={e => update('villes_cibles', e.target.value)} placeholder="Lyon, Saint-Étienne, Villeurbanne..." rows={2} />
            </div>
            <div className="form-group">
              <label className="form-label">Ouvert à d'autres villes si critères remplis ?</label>
              <div className="form-radio-group">
                {['Oui rendement prime', 'Oui rayon 200km', 'Non'].map(opt => (
                  <label key={opt} className={`form-radio-option ${form.ouvert_autres_villes === opt ? 'selected' : ''}`}>
                    <input type="radio" name="villes" value={opt} checked={form.ouvert_autres_villes === opt} onChange={() => update('ouvert_autres_villes', opt)} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">DPE minimum acceptable</label>
                <select className="form-select" value={form.dpe_minimum} onChange={e => update('dpe_minimum', e.target.value)}>
                  <option value="">Sélectionner</option>
                  <option>A-B</option><option>C</option><option>D</option>
                  <option>E+travaux</option><option>Peu importe</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tolérance travaux</label>
                <div className="form-radio-group">
                  {['Aucun', 'Légers <15k', 'Moyens 15-40k', 'Lourds si rentable'].map(opt => (
                    <label key={opt} className={`form-radio-option ${form.tolerance_travaux === opt ? 'selected' : ''}`} style={{ fontSize: '0.8rem' }}>
                      <input type="radio" name="travaux" value={opt} checked={form.tolerance_travaux === opt} onChange={() => update('tolerance_travaux', opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Copropriété</label>
              <div className="form-radio-group">
                {['OK', 'OK si charges <100€', 'Préf mono', 'Uniquement mono'].map(opt => (
                  <label key={opt} className={`form-radio-option ${form.copro === opt ? 'selected' : ''}`}>
                    <input type="radio" name="copro" value={opt} checked={form.copro === opt} onChange={() => update('copro', opt)} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Type de location souhaité</label>
              <div className="form-checkbox-group">
                {['Longue durée', 'Meublé LMNP', 'Coloc', 'Airbnb', 'Mixte'].map(opt => (
                  <label key={opt} className={`form-checkbox-option ${form.type_location.includes(opt) ? 'selected' : ''}`}>
                    <input type="checkbox" checked={form.type_location.includes(opt)} onChange={() => toggleArray('type_location', opt)} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 3 && (
          <div>
            <h3 style={{ marginBottom: 'var(--space-lg)' }}>Contraintes & finalisation</h3>
            <div className="form-group">
              <label className="form-label">Critères rédhibitoires</label>
              <div className="form-checkbox-group">
                {['RDC', 'Dernier étage sans ascenseur', 'Zone inondable', 'Proximité voie ferrée', 'DPE FG', 'Gros travaux copro', 'Déclin démo'].map(opt => (
                  <label key={opt} className={`form-checkbox-option ${form.criteres_redhibitoires.includes(opt) ? 'selected' : ''}`}>
                    <input type="checkbox" checked={form.criteres_redhibitoires.includes(opt)} onChange={() => toggleArray('criteres_redhibitoires', opt)} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Gestion locative</label>
              <div className="form-radio-group">
                {['Moi-même', 'Agence', 'À définir'].map(opt => (
                  <label key={opt} className={`form-radio-option ${form.gestion_locative === opt ? 'selected' : ''}`}>
                    <input type="radio" name="gestion" value={opt} checked={form.gestion_locative === opt} onChange={() => update('gestion_locative', opt)} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Délai souhaité</label>
              <select className="form-select" value={form.delai_souhaite} onChange={e => update('delai_souhaite', e.target.value)}>
                <option value="">Sélectionner</option>
                <option>Moins de 2 mois</option><option>2 à 4 mois</option>
                <option>4 à 6 mois</option><option>Pas pressé</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Comment nous avez-vous connu ?</label>
              <select className="form-select" value={form.source_acquisition} onChange={e => update('source_acquisition', e.target.value)}>
                <option value="">Sélectionner</option>
                <option>Instagram</option><option>YouTube</option><option>Bouche-à-oreille</option>
                <option>Google</option><option>LinkedIn</option><option>Autre</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Commentaires / précisions</label>
              <textarea className="form-textarea" value={form.commentaires} onChange={e => update('commentaires', e.target.value)} placeholder="Des critères spécifiques, des questions, etc." rows={4} />
            </div>
          </div>
        )}

        {/* Navigation */}
        {saveError && (
          <div style={{
            background: 'var(--red-light, #fdeaea)', border: '1px solid rgba(192,57,43,0.2)',
            borderRadius: 'var(--radius-md)', padding: 'var(--space-sm) var(--space-md)',
            marginTop: 'var(--space-md)', color: 'var(--red, #c0392b)', fontSize: '0.875rem',
          }}>
            {saveError}
          </div>
        )}
        <div className="flex justify-between" style={{ marginTop: 'var(--space-xl)' }}>
          {step > 0 ? (
            <button className="btn btn-outline" onClick={() => setStep(s => s - 1)}>
              <ArrowLeft size={16} /> Précédent
            </button>
          ) : <div />}
          {step < 3 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>
              Suivant <ArrowRight size={16} />
            </button>
          ) : (
            <button className="btn btn-gold btn-lg" onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Loader2 size={18} className="spin" /> Sauvegarde...
                </span>
              ) : '✅ Soumettre mon profil'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
