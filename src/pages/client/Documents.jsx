import { useApp } from '../../context';
import { formatDate } from '../../data';
import {
  FileText, Upload, ExternalLink, CheckCircle2, Clock,
  FileSignature, Shield, CreditCard, Home, Key
} from 'lucide-react';

const docIcons = {
  mandat: FileSignature,
  financement: CreditCard,
  offre: FileText,
  compromis: Home,
  bail: Key,
};

export default function Documents() {
  const { documents } = useApp();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🔐 Coffre-fort documentaire</h1>
        <p className="page-subtitle">Tous vos documents importants, sécurisés et accessibles en un clic.</p>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-header">
          <h3 className="card-title">Documents du projet</h3>
          <span className="badge badge-green">
            {documents.filter(d => d.statut === 'signé').length}/{documents.length} signés
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="flex justify-between mb-md">
            <span className="text-sm text-gray">Progression documentaire</span>
            <span className="text-sm" style={{ fontWeight: 600 }}>
              {Math.round((documents.filter(d => d.statut === 'signé').length / documents.length) * 100)}%
            </span>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill gold"
              style={{ width: `${(documents.filter(d => d.statut === 'signé').length / documents.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="doc-list">
          {documents.map(doc => {
            const Icon = docIcons[doc.type] || FileText;
            const signed = doc.statut === 'signé';
            return (
              <div key={doc.id} className="doc-item">
                <div className="doc-icon" style={{
                  background: signed ? 'var(--green-bg)' : 'var(--gray-50)',
                  color: signed ? 'var(--green)' : 'var(--gray-400)'
                }}>
                  <Icon size={20} />
                </div>
                <div className="doc-info">
                  <div className="doc-name">{doc.nom}</div>
                  <div className="doc-meta">
                    {signed ? `Signé le ${formatDate(doc.date)}` : 'En attente de signature'}
                  </div>
                </div>
                <span className={`badge ${signed ? 'badge-green' : 'badge-orange'}`}>
                  {signed ? <><CheckCircle2 size={12} /> Signé</> : <><Clock size={12} /> En attente</>}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload section */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-header">
          <h3 className="card-title">📤 Envoyer vos pièces</h3>
        </div>
        <p className="text-sm text-gray" style={{ marginBottom: 'var(--space-md)' }}>
          Déposez ici les documents demandés (pièce d'identité, bulletins de salaire, avis d'imposition...).
        </p>
        <div style={{
          border: '2px dashed var(--gray-300)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-2xl)',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          background: 'var(--gray-50)'
        }}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload size={32} color="var(--gray-400)" />
          <p style={{ marginTop: 'var(--space-sm)', marginBottom: 'var(--space-xs)', fontWeight: 600 }}>
            Glisser-déposer vos fichiers ici
          </p>
          <p className="text-sm text-gray" style={{ marginBottom: 0 }}>ou cliquer pour sélectionner (PDF, JPG, PNG — max 10Mo)</p>
        </div>
      </div>

      {/* Signature */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title"><Shield size={20} style={{ display: 'inline', verticalAlign: 'middle' }} /> Signatures électroniques</h3>
        </div>
        <p className="text-sm text-gray" style={{ marginBottom: 'var(--space-md)' }}>
          Les documents nécessitant votre signature seront disponibles ici via notre plateforme de signature sécurisée.
        </p>
        <button className="btn btn-outline">
          <ExternalLink size={16} /> Accéder à la plateforme de signature
        </button>
      </div>
    </div>
  );
}
