import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, width = 600 }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-lg)',
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        }}
      />

      {/* Content */}
      <div style={{
        position: 'relative', background: 'white',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
        width: '100%', maxWidth: width, maxHeight: '90vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        animation: 'fadeIn 0.2s ease-out',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'var(--space-lg) var(--space-xl)',
          borderBottom: '1px solid var(--gray-200)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.2rem',
            fontWeight: 600, margin: 0,
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--gray-400)', padding: 4, borderRadius: 'var(--radius-sm)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{
          padding: 'var(--space-xl)',
          overflowY: 'auto', flex: 1,
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
