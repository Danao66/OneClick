// ═══════════════════════════════════════════
// Webhook Service — Make.com / Zapier / n8n
// ═══════════════════════════════════════════

const STORAGE_KEY = 'cleenmain_webhooks';

// Default webhook configurations
const defaultWebhooks = [
  { id: 'wh_new_client', name: 'Nouveau client inscrit', event: 'client.registered', url: '', enabled: false, lastFired: null, fireCount: 0 },
  { id: 'wh_onboarding', name: 'Onboarding complété', event: 'client.onboarded', url: '', enabled: false, lastFired: null, fireCount: 0 },
  { id: 'wh_bien_added', name: 'Nouveau bien ajouté', event: 'bien.added', url: '', enabled: false, lastFired: null, fireCount: 0 },
  { id: 'wh_pepite', name: 'Pépite détectée (Score > 85)', event: 'bien.pepite', url: '', enabled: false, lastFired: null, fireCount: 0 },
  { id: 'wh_offre', name: 'Offre validée par client', event: 'bien.offer_validated', url: '', enabled: false, lastFired: null, fireCount: 0 },
  { id: 'wh_document', name: 'Document uploadé', event: 'document.uploaded', url: '', enabled: false, lastFired: null, fireCount: 0 },
  { id: 'wh_phase', name: 'Changement de phase client', event: 'client.phase_changed', url: '', enabled: false, lastFired: null, fireCount: 0 },
];

// Load webhooks from localStorage
export function getWebhooks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to add any new webhooks
      return defaultWebhooks.map(def => {
        const existing = parsed.find(w => w.id === def.id);
        return existing ? { ...def, ...existing } : def;
      });
    }
  } catch { /* ignore */ }
  return defaultWebhooks;
}

// Save webhooks to localStorage
export function saveWebhooks(webhooks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(webhooks));
  } catch { /* ignore */ }
}

// Fire a webhook
export async function fireWebhook(eventName, payload) {
  const webhooks = getWebhooks();
  const webhook = webhooks.find(w => w.event === eventName && w.enabled && w.url);
  
  if (!webhook) return null;

  try {
    const body = {
      event: eventName,
      timestamp: new Date().toISOString(),
      source: 'cle-en-main-3.0',
      data: payload,
    };

    // Fire and forget (don't block the UI)
    fetch(webhook.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      mode: 'no-cors', // Make.com webhooks don't support CORS
    }).catch(err => console.warn(`Webhook ${eventName} failed:`, err));

    // Update stats
    webhook.lastFired = new Date().toISOString();
    webhook.fireCount = (webhook.fireCount || 0) + 1;
    saveWebhooks(webhooks);

    console.log(`🔗 Webhook fired: ${eventName}`, body);
    return true;
  } catch (err) {
    console.error(`Webhook ${eventName} error:`, err);
    return false;
  }
}

// Log an automation execution
const LOG_KEY = 'cleenmain_auto_log';

export function logAutomation(eventName, details) {
  try {
    const logs = getAutomationLogs();
    logs.unshift({
      id: Date.now().toString(36),
      event: eventName,
      details,
      timestamp: new Date().toISOString(),
    });
    // Keep last 50 logs
    localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, 50)));
  } catch { /* ignore */ }
}

export function getAutomationLogs() {
  try {
    const stored = localStorage.getItem(LOG_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function clearAutomationLogs() {
  try { localStorage.removeItem(LOG_KEY); } catch { /* ignore */ }
}
