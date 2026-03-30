import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FileText, FolderLock, HardHat, ClipboardList,
  Users, Building2, Handshake, Calculator, DollarSign, Zap,
  Menu, X, LogOut, ArrowLeftRight, Sparkles
} from 'lucide-react';

const clientLinks = [
  { to: '/client', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/client/pitch-deck', icon: FileText, label: 'Pitch Deck' },
  { to: '/client/documents', icon: FolderLock, label: 'Coffre-fort' },
  { to: '/client/travaux', icon: HardHat, label: 'Suivi Travaux' },
  { to: '/client/onboarding', icon: ClipboardList, label: 'Onboarding' },
];

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/clients', icon: Users, label: 'Clients (CRM)' },
  { to: '/admin/biens', icon: Building2, label: 'Base Biens' },
  { to: '/admin/agences', icon: Handshake, label: 'Agences' },
  { to: '/admin/moteur', icon: Calculator, label: 'Moteur Immo' },
  { to: '/admin/financier', icon: DollarSign, label: 'Suivi Financier' },
  { to: '/admin/automatisations', icon: Zap, label: 'Automatisations' },
];

export default function Sidebar({ type = 'client' }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut, isAdmin: userIsAdmin, user, isDemo } = useAuth();
  const navigate = useNavigate();
  const links = type === 'admin' ? adminLinks : clientLinks;
  const isAdmin = type === 'admin';

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(true)}
        style={{ position: 'fixed', top: 16, left: 16, zIndex: 300 }}
      >
        <Menu size={24} />
      </button>

      <div
        className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="sidebar-logo">
            Clé<span>enMain</span>
          </div>
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(false)}
            style={{ display: mobileOpen ? 'flex' : 'none' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Demo badge */}
        {isDemo && (
          <div style={{
            background: 'rgba(200,169,110,0.1)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 10px',
            margin: 'var(--space-sm) 0',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.7rem',
            color: 'var(--gold-dark)',
            fontWeight: 600,
          }}>
            <Sparkles size={12} /> Mode Démo
          </div>
        )}

        {isAdmin && (
          <div className="sidebar-section-title">Administration</div>
        )}
        {!isAdmin && (
          <div className="sidebar-section-title">Mon espace</div>
        )}

        <nav className="sidebar-nav">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/client' || link.to === '/admin'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              <link.icon size={20} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 'var(--space-md)', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Switch view (admin only) */}
          {userIsAdmin && (
            <NavLink
              to={isAdmin ? '/client' : '/admin'}
              className="sidebar-link"
              style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}
            >
              <ArrowLeftRight size={16} />
              {isAdmin ? 'Vue Client' : 'Back-Office'}
            </NavLink>
          )}

          {/* User info + logout */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', borderRadius: 'var(--radius-md)',
            background: 'var(--gray-50)',
          }}>
            <div style={{ fontSize: '0.75rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {user?.prenom ? `${user.prenom} ${user.nom}` : user?.email?.split('@')[0]}
              </div>
              <div style={{ color: 'var(--gray-400)' }}>
                {userIsAdmin ? 'Administrateur' : 'Client'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Se déconnecter"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--gray-400)', padding: 4,
                borderRadius: 'var(--radius-sm)',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.target.style.color = 'var(--red)'}
              onMouseLeave={e => e.target.style.color = 'var(--gray-400)'}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
