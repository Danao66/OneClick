// ═══════════════════════════════════════════
// Webhook Service — Make.com / Zapier / n8n
// ═══════════════════════════════════════════

const STORAGE_KEY = 'cleenmain_webhooks';

// Default webhook configurations — Make.com URLs pre-configured
const defaultWebhooks = [
  { id: 'wh_new_client', name: 'Nouveau client inscrit', event: 'client.registered', url: 'https://hook.eu1.make.com/t2cb5um7eoj128havypuwd987yllll33', enabled: true, lastFired: null, fireCount: 0 },
  { id: 'wh_onboarding', name: 'Onboarding complété', event: 'client.onboarded', url: 'https://hook.eu1.make.com/fk27dj912bg3f21syaj77360jqw51r6i', enabled: true, lastFired: null, fireCount: 0 },
  { id: 'wh_bien_added', name: 'Nouveau bien ajouté', event: 'bien.added', url: 'https://hook.eu1.make.com/nzqw36zz6wnwk03x51zptf50ahe37sgn', enabled: true, lastFired: null, fireCount: 0 },
  { id: 'wh_pepite', name: 'Pépite détectée (Score > 85)', event: 'bien.pepite', url: 'https://hook.eu1.make.com/ib14v1slukxumi9b7dnep9g6f7hqnhq5', enabled: true, lastFired: null, fireCount: 0 },
  { id: 'wh_offre', name: 'Offre validée par client', event: 'bien.offer_validated', url: 'https://hook.eu1.make.com/ccytmbkcgtxiwv7ukivvglfghectb5je', enabled: true, lastFired: null, fireCount: 0 },
  { id: 'wh_document', name: 'Document uploadé', event: 'document.uploaded', url: 'https://hook.eu1.make.com/rvsqwmqmt6t936uetu7ihxe6vu887j56', enabled: true, lastFired: null, fireCount: 0 },
  { id: 'wh_phase', name: 'Changement de phase client', event: 'client.phase_changed', url: 'https://hook.eu1.make.com/oj8859tqdtalx2thl0hshc7j9q6ww3sh', enabled: true, lastFired: null, fireCount: 0 },
];

// Load webhooks from localStorage
export function getWebhooks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge: keep user overrides, but fill in default URLs if stored one is empty
      return defaultWebhooks.map(def => {
        const existing = parsed.find(w => w.id === def.id);
        if (!existing) return def;
        // If stored has no URL but default does, use the default
        const url = existing.url || def.url;
        const enabled = existing.url ? existing.enabled : def.enabled;
        return { ...def, ...existing, url, enabled };
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
