import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../data';
import { isSupabaseConfigured } from '../../lib/supabase';
import * as storage from '../../lib/storageService';
import { fireWebhook, logAutomation } from '../../lib/webhookService';
import {
  FileText, Upload, Download, CheckCircle2, Clock,
  FileSignature, Shield, CreditCard, Home, Key, Trash2,
  Loader2, AlertCircle, File, Image, FileCheck
} from 'lucide-react';

const docIcons = {
  mandat: FileSignature,
  financement: CreditCard,
  offre: FileText,
  compromis: Home,
  bail: Key,
  identite: Shield,
  general: File,
};

const categoryLabels = {
  identite: "Pièce d'identité",
  revenus: 'Bulletins de salaire',
  impots: "Avis d'imposition",
  financement: 'Attestation de financement',
  mandat: 'Mandat de recherche',
  offre: "Offre d'achat",
  compromis: 'Compromis de vente',
  bail: 'Bail locatif',
  general: 'Autre document',
};

export default function Documents() {
  const { currentClient, documents: mockDocuments } = useApp();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [docs, setDocs] = useState(mockDocuments || []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [category, setCategory] = useState('general');
  const [dragOver, setDragOver] = useState(false);
  const [downloading, setDownloading] = useState(null);

  // Load real documents from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured || !currentClient?.id) return;
    storage.fetchDocuments(currentClient.id).then(data => {
      if (data && data.length > 0) setDocs(data);
    });
  }, [currentClient?.id]);

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    if (!isSupabaseConfigured) {
      setUploadError('Upload non disponible en mode démo');
      return;
    }
    if (!currentClient?.id || currentClient.isNew) {
      setUploadError('Veuillez d\'abord compléter votre onboarding');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          setUploadError(`${file.name} dépasse 10 Mo`);
          continue;
        }
        const doc = await storage.uploadDocument(file, currentClient.id, category);
        setDocs(prev => [doc, ...prev]);
      }
      setUploadSuccess(`${files.length} fichier(s) envoyé(s) avec succès`);
      // Fire webhook
      fireWebhook('document.uploaded', { client: currentClient?.prenom + ' ' + currentClient?.nom, category, fileCount: files.length });
      logAutomation('document.uploaded', `${files.length} document(s) uploadé(s) par ${currentClient?.prenom} ${currentClient?.nom}`);
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Erreur lors de l\'envoi');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    if (!doc.storage_path) return;
    setDownloading(doc.id);
    try {
      const url = await storage.getDocumentUrl(doc.storage_path);
      if (url) window.open(url, '_blank');
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const signedCount = docs.filter(d => d.statut === 'signé').length;
  const totalDocs = docs.length || 1;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🔐 Coffre-fort documentaire</h1>
        <p className="page-subtitle">Tous vos documents importants, sécurisés et accessibles en un clic.</p>
      </div>

      {/* Document list */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card-header">
          <h3 className="card-title">Documents du projet</h3>
          <span className="badge badge-green">
            {signedCount}/{docs.length} signés
          </span>
        </div>

        {/* Progress bar */}
        {docs.length > 0 && (
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="flex justify-between mb-md">
              <span className="text-sm text-gray">Progression documentaire</span>
              <span className="text-sm" style={{ fontWeight: 600 }}>
                {Math.round((signedCount / totalDocs) * 100)}%
              </span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill gold" style={{ width: `${(signedCount / totalDocs) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="doc-list">
          {docs.length === 0 && (
            <p className="text-sm text-gray" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
              Aucun document pour le moment. Utilisez la zone ci-dessous pour envoyer vos premiers fichiers.
            </p>
          )}
          {docs.map(doc => {
            const Icon = docIcons[doc.type] || FileText;
            const signed = doc.statut === 'signé';
            const isUploaded = doc.statut === 'envoyé';
            return (
              <div key={doc.id} className="doc-item" style={{ cursor: doc.storage_path ? 'pointer' : 'default' }}
                onClick={() => doc.storage_path && handleDownload(doc)}
              >
                <div className="doc-icon" style={{
                  background: signed ? 'var(--green-bg)' : isUploaded ? 'var(--blue-bg, #e8f4f8)' : 'var(--gray-50)',
                  color: signed ? 'var(--green)' : isUploaded ? 'var(--blue, #2980b9)' : 'var(--gray-400)'
                }}>
                  <Icon size={20} />
                </div>
                <div className="doc-info">
                  <div className="doc-name">{doc.nom}</div>
                  <div className="doc-meta">
                    {signed ? `Signé le ${formatDate(doc.date)}` :
                     isUploaded ? `Envoyé le ${formatDate(doc.date)}${doc.file_size ? ' • ' + storage.formatFileSize(doc.file_size) : ''}` :
                     'En attente de signature'}
                  </div>
                </div>
                <div className="flex gap-sm items-center">
                  {doc.storage_path && (
                    <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                      disabled={downloading === doc.id}
                    >
                      {downloading === doc.id ? <Loader2 size={14} className="spin" /> : <Download size={14} />}
                    </button>
                  )}
                  <span className={`badge ${signed ? 'badge-green' : isUploaded ? 'badge-blue' : 'badge-orange'}`}>
                    {signed ? <><CheckCircle2 size={12} /> Signé</> :
                     isUploaded ? <><FileCheck size={12} /> Envoyé</> :
                     <><Clock size={12} /> En attente</>}
                  </span>
                </div>
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

        {/* Category selector */}
        <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
          <label className="form-label">Catégorie du document</label>
          <select className="form-select" value={category} onChange={e => setCategory(e.target.value)} style={{ maxWidth: 300 }}>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Messages */}
        {uploadError && (
          <div style={{
            background: '#fdeaea', border: '1px solid rgba(192,57,43,0.2)',
            borderRadius: 'var(--radius-md)', padding: 'var(--space-sm) var(--space-md)',
            marginBottom: 'var(--space-md)', color: '#c0392b', fontSize: '0.875rem',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <AlertCircle size={16} /> {uploadError}
          </div>
        )}
        {uploadSuccess && (
          <div style={{
            background: 'var(--green-bg)', border: '1px solid rgba(29,107,82,0.2)',
            borderRadius: 'var(--radius-md)', padding: 'var(--space-sm) var(--space-md)',
            marginBottom: 'var(--space-md)', color: 'var(--green)', fontSize: '0.875rem',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <CheckCircle2 size={16} /> {uploadSuccess}
          </div>
        )}

        {/* Drop zone */}
        <div
          style={{
            border: `2px dashed ${dragOver ? 'var(--gold)' : 'var(--gray-300)'}`,
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2xl)',
            textAlign: 'center',
            cursor: uploading ? 'wait' : 'pointer',
            transition: 'all var(--transition-fast)',
            background: dragOver ? 'var(--gold-light, #fdf6e3)' : 'var(--gray-50)',
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 size={32} className="spin" style={{ color: 'var(--gold)' }} />
              <p style={{ marginTop: 'var(--space-sm)', fontWeight: 600 }}>Envoi en cours...</p>
            </>
          ) : (
            <>
              <Upload size={32} color={dragOver ? 'var(--gold)' : 'var(--gray-400)'} />
              <p style={{ marginTop: 'var(--space-sm)', marginBottom: 'var(--space-xs)', fontWeight: 600 }}>
                Glisser-déposer vos fichiers ici
              </p>
              <p className="text-sm text-gray" style={{ marginBottom: 0 }}>
                ou cliquer pour sélectionner (PDF, JPG, PNG — max 10Mo)
              </p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          style={{ display: 'none' }}
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {/* Signature section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title"><Shield size={20} style={{ display: 'inline', verticalAlign: 'middle' }} /> Signatures électroniques</h3>
        </div>
        <p className="text-sm text-gray" style={{ marginBottom: 'var(--space-md)' }}>
          Les documents nécessitant votre signature seront disponibles ici via notre plateforme de signature sécurisée.
        </p>
        <button className="btn btn-outline">
          <FileSignature size={16} /> Accéder à la plateforme de signature
        </button>
      </div>
    </div>
  );
}
