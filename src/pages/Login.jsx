import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';

export default function Login() {
  const { signIn, error, setError, isDemo } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { role } = await signIn(email, password);
      navigate(role === 'admin' ? '/admin' : '/client', { replace: true });
    } catch {
      // error is set in signIn
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (type) => {
    if (type === 'admin') {
      setEmail('admin@cleenmain.fr');
      setPassword('admin123');
    } else {
      setEmail('julien.moreau@email.com');
      setPassword('client123');
    }
    setError(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F7F5F0 0%, #EDE8DF 50%, #F7F5F0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-lg)',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.2rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-xs)',
          }}>
            <span style={{ color: 'var(--gold)' }}>Clé</span>enMain
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--gray-500)',
            fontSize: '0.9rem',
            letterSpacing: '0.05em',
          }}>
            INVESTISSEMENT IMMOBILIER PREMIUM
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-2xl)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
          border: '1px solid rgba(200,169,110,0.15)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto var(--space-md)',
              boxShadow: '0 4px 12px rgba(200,169,110,0.3)',
            }}>
              <Lock size={24} color="white" />
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 4,
            }}>
              Connexion
            </h2>
            <p className="text-sm text-gray">Accédez à votre espace sécurisé</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'var(--red-light)',
              border: '1px solid rgba(192,57,43,0.2)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-sm) var(--space-md)',
              marginBottom: 'var(--space-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--red)',
              fontSize: '0.875rem',
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--gray-400)',
                }} />
                <input
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(null); }}
                  placeholder="votre@email.com"
                  required
                  autoComplete="email"
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
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(null); }}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ paddingLeft: 40, paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: 'var(--gray-400)',
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-gold btn-lg"
              disabled={isLoading}
              style={{
                width: '100%',
                marginTop: 'var(--space-md)',
                opacity: isLoading ? 0.7 : 1,
                position: 'relative',
              }}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <div style={{
                    width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite',
                  }} />
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>

        {/* Demo mode helper */}
        {isDemo && (
          <div style={{
            marginTop: 'var(--space-lg)',
            background: 'rgba(200,169,110,0.08)',
            border: '1px solid rgba(200,169,110,0.2)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-md)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              marginBottom: 'var(--space-sm)', color: 'var(--gold-dark)',
              fontWeight: 600, fontSize: '0.85rem',
            }}>
              <Sparkles size={14} /> Mode Démo
            </div>
            <p className="text-xs text-gray" style={{ marginBottom: 'var(--space-sm)' }}>
              Supabase non configuré. Utilisez les comptes de démonstration :
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => fillDemo('admin')}
                style={{ flex: 1 }}
              >
                🔧 Admin
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fillDemo('client')}
                style={{ flex: 1 }}
              >
                👤 Client (Julien)
              </button>
            </div>
          </div>
        )}

        {/* Register link */}
        <p style={{
          textAlign: 'center',
          marginTop: 'var(--space-lg)',
          fontSize: '0.875rem',
          color: 'var(--gray-500)',
        }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color: 'var(--gold)', fontWeight: 600, textDecoration: 'none' }}>
            Créer un compte
          </Link>
        </p>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          marginTop: 'var(--space-md)',
          fontSize: '0.75rem',
          color: 'var(--gray-400)',
        }}>
          © 2026 Clé en Main — Tous droits réservés
        </p>
      </div>
    </div>
  );
}
