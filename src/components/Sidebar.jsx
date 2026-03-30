import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, FileText, FolderLock, HardHat, ClipboardList,
  Users, Building2, Handshake, Calculator, DollarSign, Zap,
  Menu, X, LogOut
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
  const location = useLocation();
  const links = type === 'admin' ? adminLinks : clientLinks;
  const isAdmin = type === 'admin';

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

        <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 'var(--space-md)', marginTop: 'auto' }}>
          <NavLink
            to={isAdmin ? '/client' : '/admin'}
            className="sidebar-link"
            style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}
          >
            <LogOut size={16} />
            {isAdmin ? 'Vue Client' : 'Back-Office'}
          </NavLink>
        </div>
      </aside>
    </>
  );
}
