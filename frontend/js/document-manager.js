window.docManager = (function () {
  function initFirstDocumentIfEmpty() {
    const docs = storage.listDocuments();
    if (docs.length === 0) {
      const doc = storage.createDocument({ title: "Untitled document", content: "" });
      return doc.id;
    }
    return docs[0].id;
  }

  function getInitialDocumentId() {
    const url = new URL(window.location.href);
    const docId = url.searchParams.get("doc");
    if (docId && storage.getDocument(docId)) return docId;
    return initFirstDocumentIfEmpty();
  }

  function setCurrentDocumentIdInUrl(id) {
    const url = new URL(window.location.href);
    url.searchParams.set("doc", id);
    window.history.pushState({ docId: id }, "", url.toString());
  }

  let documentListContainer;
  let newDocumentButton;
  let documentSearchInput;
  let documentSortSelect;
  let currentSearchQuery = '';
  let currentSortOption = 'updated_at';

  function renderDocumentList() {
    let documents = storage.listDocuments();

    // Filter documents based on search query
    if (currentSearchQuery) {
      documents = documents.filter(doc => 
        doc.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) || 
        doc.content.toLowerCase().includes(currentSearchQuery.toLowerCase())
      );
    }

    // Sort documents
    documents.sort((a, b) => {
      if (currentSortOption === 'title') {
        return a.title.localeCompare(b.title);
      } else if (currentSortOption === 'word_count') {
        return a.word_count - b.word_count;
      } else if (currentSortOption === 'created_at') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else { // Default to updated_at
        return new Date(b.updated_at) - new Date(a.updated_at);
      }
    });

    documentListContainer.innerHTML = '';

    if (documents.length === 0) {
      documentListContainer.innerHTML = '<p class="empty-state">No documents yet. Create a new one!</p>';
      return;
    }

    documents.forEach(doc => {
      const docItem = document.createElement('div');
      docItem.className = 'document-item';
      if (window.editorApi.getCurrentDocId() === doc.id) {
        docItem.classList.add('active');
      }
      docItem.dataset.docId = doc.id;

      docItem.innerHTML = `
        <div class="doc-main-info">
          <span class="doc-title-list">${doc.title || "Untitled"}</span>
          <span class="doc-meta">${utils.countWords(doc.content)} words - ${new Date(doc.updated_at).toLocaleDateString()}</span>
        </div>
        <div class="doc-actions">
          <button class="icon-button duplicate-doc" title="Duplicate Document">📋</button>
          <button class="icon-button delete-doc" title="Delete Document">🗑️</button>
        </div>
      `;

      documentListContainer.appendChild(docItem);
    });
  }

  function setupEventListeners() {
    newDocumentButton.addEventListener('click', createNewDocument);

    documentSearchInput.addEventListener('input', utils.debounce((e) => {
      currentSearchQuery = e.target.value;
      renderDocumentList();
    }, 300));

    documentSortSelect.addEventListener('change', (e) => {
      currentSortOption = e.target.value;
      renderDocumentList();
    });

    documentListContainer.addEventListener('click', (e) => {
      const docItem = e.target.closest('.document-item');
      if (!docItem) return;
      const docId = docItem.dataset.docId;

      if (e.target.classList.contains('delete-doc')) {
        if (confirm('Are you sure you want to delete this document?')) {
          deleteDocument(docId);
        }
      } else if (e.target.classList.contains('duplicate-doc')) {
        duplicateDocument(docId);
      } else {
        window.editorApi.loadDocument(docId);
        renderDocumentList(); // Re-render to update active state
      }
    });
  }

  function createNewDocument() {
    const newDoc = storage.createDocument();
    window.editorApi.loadDocument(newDoc.id);
    renderDocumentList();
  }

  function deleteDocument(id) {
    storage.deleteDocument(id);
    const remainingDocs = storage.listDocuments();
    if (remainingDocs.length > 0) {
      window.editorApi.loadDocument(remainingDocs[0].id);
    } else {
      // Create a new document if all are deleted
      createNewDocument();
    }
    renderDocumentList();
  }

  function duplicateDocument(id) {
    const duplicatedDoc = storage.duplicateDocument(id);
    if (duplicatedDoc) {
      window.editorApi.loadDocument(duplicatedDoc.id);
    }
    renderDocumentList();
  }

  function init(listContainer, newDocButton) {
    documentListContainer = listContainer;
    newDocumentButton = newDocButton;
    documentSearchInput = document.getElementById('document-search');
    documentSortSelect = document.getElementById('document-sort');
    setupEventListeners();
    renderDocumentList();

    // Set initial sort option if available in settings
    const settings = storage.getSettings();
    if (settings.documentSortOption) {
      currentSortOption = settings.documentSortOption;
      documentSortSelect.value = settings.documentSortOption;
    }

    // Save sort option on change
    documentSortSelect.addEventListener('change', (e) => {
      storage.updateSettings({ documentSortOption: e.target.value });
    });
  }

  return {
    getInitialDocumentId,
    setCurrentDocumentIdInUrl,
    renderDocumentList,
    init,
  };
})();


