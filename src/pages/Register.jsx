import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, Eye, EyeOff, AlertCircle, User, CheckCircle } from 'lucide-react';

export default function Register() {
  const { signUp, signIn, error, setError, isDemo } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const passwordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = passwordStrength(form.password);
  const strengthLabels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
  const strengthColors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1D6B52'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);
    try {
      await signUp(form.email, form.password, {
        prenom: form.prenom,
        nom: form.nom,
        role: 'client',
      });

      // Auto sign-in after registration
      try {
        await signIn(form.email, form.password);
        navigate('/client/onboarding', { replace: true });
      } catch {
        // If auto sign-in fails (e.g. email confirmation required)
        setSuccess(true);
      }
    } catch {
      // error is set in signUp
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F7F5F0 0%, #EDE8DF 50%, #F7F5F0 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'var(--space-lg)',
      }}>
        <div style={{
          background: 'white', borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-2xl)', maxWidth: 440, width: '100%',
          textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--green), var(--green-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto var(--space-lg)',
          }}>
            <CheckCircle size={32} color="white" />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.4rem',
            fontWeight: 600, marginBottom: 'var(--space-sm)',
          }}>
            Compte créé avec succès !
          </h2>
          <p className="text-sm text-gray" style={{ marginBottom: 'var(--space-lg)' }}>
            Vérifiez votre email pour confirmer votre compte, puis connectez-vous.
          </p>
          <Link to="/login" className="btn btn-gold btn-lg" style={{ width: '100%', textDecoration: 'none' }}>
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F7F5F0 0%, #EDE8DF 50%, #F7F5F0 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-lg)',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '2.2rem',
            fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-xs)',
          }}>
            <span style={{ color: 'var(--gold)' }}>Clé</span>enMain
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)', color: 'var(--gray-500)',
            fontSize: '0.9rem', letterSpacing: '0.05em',
          }}>
            INVESTISSEMENT IMMOBILIER PREMIUM
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white', borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-2xl)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
          border: '1px solid rgba(200,169,110,0.15)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--green), var(--green-dark, #15573F))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto var(--space-md)',
              boxShadow: '0 4px 12px rgba(29,107,82,0.3)',
            }}>
              <UserPlus size={24} color="white" />
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.4rem',
              fontWeight: 600, marginBottom: 4,
            }}>
              Créer votre espace
            </h2>
            <p className="text-sm text-gray">Rejoignez l'expérience Clé en Main</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'var(--red-light, #fdeaea)', border: '1px solid rgba(192,57,43,0.2)',
              borderRadius: 'var(--radius-md)', padding: 'var(--space-sm) var(--space-md)',
              marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center',
              gap: 8, color: 'var(--red, #c0392b)', fontSize: '0.875rem',
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Demo warning */}
          {isDemo && (
            <div style={{
              background: 'rgba(200,169,110,0.08)', border: '1px solid rgba(200,169,110,0.2)',
              borderRadius: 'var(--radius-md)', padding: 'var(--space-sm) var(--space-md)',
              marginBottom: 'var(--space-md)', fontSize: '0.8rem', color: 'var(--gold-dark)',
            }}>
              ⚠️ L'inscription n'est pas disponible en mode démo.
              <Link to="/login" style={{ color: 'var(--gold)', marginLeft: 4 }}>
                Connectez-vous avec un compte démo →
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Prénom</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{
                    position: 'absolute', left: 12, top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--gray-400)',
                  }} />
                  <input
                    className="form-input" type="text" value={form.prenom}
                    onChange={e => updateField('prenom', e.target.value)}
                    placeholder="Julien" required style={{ paddingLeft: 40 }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Nom</label>
                <input
                  className="form-input" type="text" value={form.nom}
                  onChange={e => updateField('nom', e.target.value)}
                  placeholder="Moreau" required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--gray-400)',
                }} />
                <input
                  className="form-input" type="email" value={form.email}
                  onChange={e => updateField('email', e.target.value)}
                  placeholder="votre@email.com" required autoComplete="email"
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--gray-400)',
                }} />
                <input
                  className="form-input" type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => updateField('password', e.target.value)}
                  placeholder="••••••••" required autoComplete="new-password"
                  style={{ paddingLeft: 40, paddingRight: 40 }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength meter */}
              {form.password && (
                <div style={{ marginTop: 6 }}>
                  <div style={{
                    display: 'flex', gap: 4, marginBottom: 4,
                  }}>
                    {[0,1,2,3].map(i => (
                      <div key={i} style={{
                        height: 3, flex: 1, borderRadius: 2,
                        background: i < strength ? strengthColors[strength] : 'var(--gray-200)',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: strengthColors[strength] }}>
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirmer le mot de passe</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--gray-400)',
                }} />
                <input
                  className="form-input" type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={e => updateField('confirmPassword', e.target.value)}
                  placeholder="••••••••" required autoComplete="new-password"
                  style={{
                    paddingLeft: 40,
                    borderColor: form.confirmPassword && form.confirmPassword !== form.password
                      ? 'var(--red, #c0392b)' : undefined,
                  }}
                />
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-gold btn-lg"
              disabled={isLoading || isDemo}
              style={{
                width: '100%', marginTop: 'var(--space-sm)',
                opacity: (isLoading || isDemo) ? 0.7 : 1,
              }}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <div style={{
                    width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite',
                  }} />
                  Création...
                </span>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>
        </div>

        {/* Login link */}
        <p style={{
          textAlign: 'center', marginTop: 'var(--space-lg)',
          fontSize: '0.875rem', color: 'var(--gray-500)',
        }}>
          Déjà un compte ?{' '}
          <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 600, textDecoration: 'none' }}>
            Se connecter
          </Link>
        </p>

        {/* Footer */}
        <p style={{
          textAlign: 'center', marginTop: 'var(--space-md)',
          fontSize: '0.75rem', color: 'var(--gray-400)',
        }}>
          © 2026 Clé en Main — Tous droits réservés
        </p>
      </div>
    </div>
  );
}
