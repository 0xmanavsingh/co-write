(function () {
  const STORAGE_KEY = "co_write";
  const DEFAULT_SETTINGS = { theme: "light", auto_save_interval: 2000, markdown_mode: true };

  function ensureRoot() {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (!existing.documents) existing.documents = {};
    if (!existing.settings) existing.settings = { ...DEFAULT_SETTINGS };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return existing;
  }

  function readRoot() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  }

  function writeRoot(root) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(root));
  }

  function generateId() {
    return (crypto && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
  }

  function nowIso() { return new Date().toISOString(); }

  function createDocument({ title = "Untitled", content = "" } = {}) {
    const root = ensureRoot();
    const id = generateId();
    const doc = { id, title, content, created_at: nowIso(), updated_at: nowIso(), word_count: 0 };
    root.documents[id] = doc;
    writeRoot(root);
    return doc;
  }

  function updateDocument(id, updates) {
    const root = ensureRoot();
    const doc = root.documents[id];
    if (!doc) return null;
    root.documents[id] = { ...doc, ...updates, updated_at: nowIso() };
    writeRoot(root);
    return root.documents[id];
  }

  function deleteDocument(id) {
    const root = ensureRoot();
    delete root.documents[id];
    writeRoot(root);
  }

  function duplicateDocument(id) {
    const root = ensureRoot();
    const doc = root.documents[id];
    if (!doc) return null;
    return createDocument({ title: doc.title + " (Copy)", content: doc.content });
  }

  function listDocuments() {
    const root = ensureRoot();
    return Object.values(root.documents);
  }

  function getDocument(id) {
    const root = ensureRoot();
    return root.documents[id] || null;
  }

  function getSettings() {
    const root = ensureRoot();
    return root.settings;
  }

  function updateSettings(updates) {
    const root = ensureRoot();
    root.settings = { ...root.settings, ...updates };
    writeRoot(root);
    return root.settings;
  }

  window.storage = {
    createDocument,
    updateDocument,
    deleteDocument,
    duplicateDocument,
    listDocuments,
    getDocument,
    getSettings,
    updateSettings,
  };
})();


