import { useState, useEffect } from 'react';
import { useApp } from '../../context';
import { getWebhooks, saveWebhooks, getAutomationLogs, clearAutomationLogs, fireWebhook, logAutomation } from '../../lib/webhookService';
import {
  Zap, CheckCircle2, AlertCircle, XCircle, Play, Calendar, Hash,
  Settings, Save, Link2, Send, Clock, Activity, Loader2, ExternalLink, Trash2
} from 'lucide-react';

const statusColors = {
  'Actif': 'badge-green', 'Erreur': 'badge-red', 'Désactivé': 'badge-gray',
};
const statusIcons = {
  'Actif': CheckCircle2, 'Erreur': AlertCircle, 'Désactivé': XCircle,
};

export default function Automatisations() {
  const { automatisations } = useApp();
  const [tab, setTab] = useState('flux'); // flux | webhooks | logs
  const [webhooks, setWebhooks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(null);

  useEffect(() => {
    setWebhooks(getWebhooks());
    setLogs(getAutomationLogs());
  }, [tab]); // Refresh when switching tabs

  const updateWebhook = (id, field, value) => {
    setWebhooks(prev => prev.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const handleSave = () => {
    saveWebhooks(webhooks);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTest = async (webhook) => {
    setTesting(webhook.id);
    try {
      await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'test',
          timestamp: new Date().toISOString(),
          source: 'cle-en-main-3.0',
          data: { message: 'Test webhook depuis Clé en Main 3.0', webhook_name: webhook.name },
        }),
        mode: 'no-cors',
      });
      logAutomation('test', `Test du webhook "${webhook.name}" envoyé`);
      setLogs(getAutomationLogs());
      alert('✅ Webhook test envoyé !');
    } catch (err) {
      alert('❌ Erreur: ' + err.message);
    } finally {
      setTesting(null);
    }
  };

  const actifs = automatisations.filter(a => a.statut === 'Actif').length;
  const totalExec = automatisations.reduce((s, a) => s + a.nb_executions, 0);
  const webhooksActifs = webhooks.filter(w => w.enabled && w.url).length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⚡ Automatisations</h1>
        <p className="page-subtitle">Flux automatisés et webhooks Make.com / Zapier</p>
      </div>

      {/* KPIs */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--space-lg)' }}>
        <div className="metric-card">
          <div className="metric-label"><Zap size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Flux actifs</div>
          <div className="metric-value" style={{ color: 'var(--green)' }}>{actifs}/{automatisations.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label"><Play size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Exécutions</div>
          <div className="metric-value">{totalExec}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label"><Link2 size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Webhooks actifs</div>
          <div className="metric-value" style={{ color: webhooksActifs > 0 ? 'var(--green)' : 'var(--gray-400)' }}>{webhooksActifs}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label"><Activity size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Logs récents</div>
          <div className="metric-value">{logs.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-sm" style={{ marginBottom: 'var(--space-lg)' }}>
        <button className={`btn ${tab === 'flux' ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setTab('flux')}>
          <Zap size={14} /> Flux automatisés
        </button>
        <button className={`btn ${tab === 'webhooks' ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setTab('webhooks')}>
          <Link2 size={14} /> Webhooks Make.com
        </button>
        <button className={`btn ${tab === 'logs' ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setTab('logs')}>
          <Clock size={14} /> Journal
        </button>
      </div>

      {/* Tab: Flux */}
      {tab === 'flux' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Tous les flux</h3>
          </div>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom du flux</th><th>Déclencheur</th><th>Actions</th>
                  <th>Phase</th><th>Statut</th><th>Dernière exécution</th><th>Exécutions</th>
                </tr>
              </thead>
              <tbody>
                {automatisations.map(auto => {
                  const StatusIcon = statusIcons[auto.statut] || Zap;
                  return (
                    <tr key={auto.id}>
                      <td>
                        <div className="flex items-center gap-sm">
                          <Zap size={16} color="var(--gold)" />
                          <span style={{ fontWeight: 600 }}>{auto.nom}</span>
                        </div>
                      </td>
                      <td className="text-sm">{auto.declencheur}</td>
                      <td className="text-sm" style={{ maxWidth: 250 }}>{auto.actions}</td>
                      <td><span className="badge badge-blue">{auto.phase}</span></td>
                      <td>
                        <span className={`badge ${statusColors[auto.statut]}`}>
                          <StatusIcon size={12} /> {auto.statut}
                        </span>
                      </td>
                      <td className="flex items-center gap-sm text-sm">
                        <Calendar size={12} color="var(--gray-400)" />
                        {new Date(auto.derniere_execution).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </td>
                      <td>
                        <span className="flex items-center gap-sm">
                          <Hash size={12} color="var(--gray-400)" />
                          <span style={{ fontWeight: 600 }}>{auto.nb_executions}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Webhooks */}
      {tab === 'webhooks' && (
        <div>
          {/* Make.com guide */}
          <div className="card" style={{ marginBottom: 'var(--space-lg)', borderLeft: '4px solid var(--gold)' }}>
            <h4 style={{ marginBottom: 'var(--space-sm)' }}>📖 Comment configurer Make.com</h4>
            <ol style={{ fontSize: '0.875rem', color: 'var(--gray-600)', paddingLeft: 20, lineHeight: 1.8 }}>
              <li>Créez un compte sur <a href="https://www.make.com" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontWeight: 600 }}>make.com <ExternalLink size={12} style={{ display: 'inline' }} /></a> (gratuit, 1000 ops/mois)</li>
              <li>Créez un nouveau <strong>Scenario</strong> → choisissez <strong>"Webhooks"</strong> comme déclencheur</li>
              <li>Sélectionnez <strong>"Custom webhook"</strong> → copiez l'URL générée</li>
              <li>Collez l'URL ci-dessous et activez le webhook</li>
              <li>Ajoutez vos actions dans Make.com (email, Google Sheets, Slack, etc.)</li>
            </ol>
          </div>

          {/* Webhook configs */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Settings size={18} /> Configuration des webhooks</h3>
              <button className="btn btn-gold btn-sm" onClick={handleSave}>
                {saved ? <><CheckCircle2 size={14} /> Sauvegardé !</> : <><Save size={14} /> Sauvegarder</>}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {webhooks.map(webhook => (
                <div key={webhook.id} style={{
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-md)',
                  background: webhook.enabled ? 'var(--green-bg)' : 'var(--gray-50)',
                  transition: 'all var(--transition-fast)',
                }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-sm)' }}>
                    <div className="flex items-center gap-sm">
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={webhook.enabled}
                          onChange={e => updateWebhook(webhook.id, 'enabled', e.target.checked)}
                          style={{ width: 18, height: 18, accentColor: 'var(--green)' }}
                        />
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{webhook.name}</span>
                      </label>
                      <span className={`badge ${webhook.enabled ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: '0.7rem' }}>
                        {webhook.event}
                      </span>
                    </div>
                    {webhook.fireCount > 0 && (
                      <span className="text-xs text-gray">{webhook.fireCount}x déclenché</span>
                    )}
                  </div>
                  <div className="flex gap-sm">
                    <input
                      className="form-input"
                      placeholder="https://hook.eu1.make.com/votre-webhook-id..."
                      value={webhook.url}
                      onChange={e => updateWebhook(webhook.id, 'url', e.target.value)}
                      style={{ flex: 1, fontSize: '0.85rem' }}
                    />
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleTest(webhook)}
                      disabled={!webhook.url || testing === webhook.id}
                      title="Tester ce webhook"
                    >
                      {testing === webhook.id ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Logs */}
      {tab === 'logs' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Clock size={18} /> Journal des automatisations</h3>
            <div className="flex gap-sm items-center">
              <span className="text-sm text-gray">{logs.length} entrées</span>
              {logs.length > 0 && (
                <button className="btn btn-outline btn-sm" onClick={() => { clearAutomationLogs(); setLogs([]); }}>
                  <Trash2 size={14} /> Vider
                </button>
              )}
            </div>
          </div>
          {logs.length === 0 ? (
            <p className="text-sm text-gray" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
              Aucune automatisation déclenchée pour le moment.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {logs.map(log => (
                <div key={log.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--gray-50)', fontSize: '0.85rem',
                }}>
                  <Zap size={14} color="var(--gold)" style={{ flexShrink: 0 }} />
                  <span className="text-gray" style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                    {new Date(log.timestamp).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="badge badge-blue" style={{ fontSize: '0.7rem', flexShrink: 0 }}>{log.event}</span>
                  <span style={{ flex: 1 }}>{log.details}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
