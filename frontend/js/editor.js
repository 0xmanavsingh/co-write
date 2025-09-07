(function () {
  const editor = document.getElementById("editor");
  const titleInput = document.getElementById("doc-title");
  const wordCount = document.getElementById("word-count");
  const saveIndicator = document.getElementById("save-indicator");
  const toolbar = document.getElementById("toolbar");
  const themeToggle = document.getElementById("theme-toggle");
  const focusModeToggle = document.getElementById("focus-mode-toggle");

  let currentDocId = null;
  let isDirty = false;
  let saveTimeout;

  function setFocusMode(enable) {
    document.body.classList.toggle('focus-mode-active', enable);
    focusModeToggle.classList.toggle('active', enable); // Add/remove active class
    focusModeToggle.textContent = enable ? 'Exit Focus Mode' : 'Focus Mode'; // Dynamic text
    storage.updateSettings({ focus_mode: enable });
  }

  function setSaveStatus(text, isError = false) {
    saveIndicator.textContent = text;
    saveIndicator.style.color = isError ? '#dc2626' : 'var(--muted)'; // Red for error, muted for others
    if (saveTimeout) clearTimeout(saveTimeout);
    if (!isError && text === 'Saved') {
      saveTimeout = setTimeout(() => {
        // Optionally fade out or hide after a delay if needed
      }, 3000);
    }
  }

  function applyWordCount() {
    const text = editor.innerText || "";
    wordCount.textContent = utils.countWords(text) + " words";
  }

  function loadDocument(id) {
    const doc = storage.getDocument(id);
    if (!doc) return;
    currentDocId = id;
    titleInput.value = doc.title || "Untitled";
    editor.innerHTML = doc.content || "";
    editor.setAttribute("data-placeholder", "Start writing...");
    applyWordCount();
    setSaveStatus("Saved");
    docManager.setCurrentDocumentIdInUrl(id);
  }

  function saveDocument() {
    if (!currentDocId) return;
    const content = editor.innerHTML;
    const title = titleInput.value.trim() || "Untitled";
    const text = editor.innerText || "";
    const doc = storage.updateDocument(currentDocId, { title, content, word_count: utils.countWords(text) });
    if (doc) {
      setSaveStatus("Saved");
      isDirty = false;
      docManager.renderDocumentList(); // Update document list on save
    } else {
      setSaveStatus("Error saving!", true);
    }
  }

  const debouncedAutoSave = utils.debounce(() => {
    if (isDirty) {
      setSaveStatus("Saving...");
      saveDocument();
    }
  }, storage.getSettings().auto_save_interval || 2000);

  editor.addEventListener("input", () => {
    isDirty = true;
    setSaveStatus("Saving..."); // Show saving immediately on input
    applyWordCount();
    debouncedAutoSave();
  });

  editor.addEventListener("selectionchange", () => {
    setTimeout(updateToolbarState, 10);
  });

  titleInput.addEventListener("input", () => {
    isDirty = true;
    setSaveStatus("Saving..."); // Show saving immediately on input
    debouncedAutoSave();
    docManager.renderDocumentList(); // Update document list on title input
  });

  document.addEventListener("keydown", (e) => {
    const mod = e.metaKey || e.ctrlKey;
    const shift = e.shiftKey;

    if (mod && e.key.toLowerCase() === "s") {
      e.preventDefault();
      saveDocument();
    }

    // Cmd/Ctrl + Shift + 8 for bullet points
    if (mod && shift && e.key === "8") {
      e.preventDefault();
      document.execCommand("insertUnorderedList", false);
      setTimeout(updateToolbarState, 10); // Small delay to ensure command is processed
    }

    // Cmd/Ctrl + Shift + 9 for checkbox list
    if (mod && shift && e.key === "9") {
      e.preventDefault();
      insertCheckboxItem();
    }

    // Update toolbar state for other shortcuts
    if (mod && (e.key.toLowerCase() === "b" || e.key.toLowerCase() === "i" || e.key.toLowerCase() === "u")) {
      setTimeout(updateToolbarState, 10);
    }
  });

  function updateToolbarState() {
    // Update button states based on current selection
    const tools = toolbar.querySelectorAll(".tool");
    tools.forEach(tool => {
      const cmd = tool.getAttribute("data-cmd");
      const block = tool.getAttribute("data-block");
      const list = tool.getAttribute("data-list");

      let isActive = false;
      if (cmd) {
        isActive = document.queryCommandState(cmd);
      } else if (block) {
        const currentBlock = document.queryCommandValue("formatBlock");
        isActive = currentBlock === block;
      }
      // Don't show active state for list buttons

      tool.classList.toggle("active", isActive);
    });
  }

  // Toolbar commands
  toolbar.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    e.preventDefault();
    editor.focus();

    const cmd = btn.getAttribute("data-cmd");
    const block = btn.getAttribute("data-block");
    const list = btn.getAttribute("data-list");

    if (cmd) {
      document.execCommand(cmd, false);
    } else if (block) {
      document.execCommand("formatBlock", false, block);
    } else if (list === "ul") {
      document.execCommand("insertUnorderedList", false);
    } else if (list === "ol") {
      document.execCommand("insertOrderedList", false);
    } else if (list === "checkbox") {
      insertCheckboxItem();
    }

    setTimeout(updateToolbarState, 10);
  });

  // Theme toggle
  themeToggle.addEventListener("click", () => {
    const current = document.body.getAttribute("data-theme") || "light";
    const next = current === "light" ? "dark" : "light";
    document.body.setAttribute("data-theme", next);
    storage.updateSettings({ theme: next });
  });

  // Focus Mode toggle
  focusModeToggle.addEventListener("click", () => {
    const current = document.body.classList.contains('focus-mode-active');
    setFocusMode(!current);
  });

  // Apply theme from settings
  (function applyThemeFromSettings() {
    const s = storage.getSettings();
    document.body.setAttribute("data-theme", s.theme || "light");
  })();

  // Apply focus mode from settings
  (function applyFocusModeFromSettings() {
    const s = storage.getSettings();
    setFocusMode(s.focus_mode || false);
  })();

  // Initialize
  window.addEventListener("DOMContentLoaded", () => {
    const id = docManager.getInitialDocumentId();
    loadDocument(id);
    updateToolbarState();
  });

  function insertCheckboxItem() {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    // Check if we're already in a checkbox list
    let checkboxList = range.startContainer.parentElement.closest('.checkbox-list');

    if (!checkboxList) {
      // Create new checkbox list
      checkboxList = document.createElement('ul');
      checkboxList.className = 'checkbox-list';
      range.insertNode(checkboxList);
    }

    // Create checkbox item
    const checkboxItem = document.createElement('li');
    checkboxItem.className = 'checkbox-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.addEventListener('change', function() {
      const item = this.parentElement;
      if (this.checked) {
        item.classList.add('checked');
      } else {
        item.classList.remove('checked');
      }
      saveDocument(); // Save after checkbox state changes
    });

    const textSpan = document.createElement('span');
    textSpan.className = 'checkbox-text';
    textSpan.contentEditable = 'true';
    textSpan.textContent = ''; // Empty for typing, rely on CSS min-height for visual space
    textSpan.setAttribute('data-placeholder', 'List item'); // Placeholder for empty list item

    checkboxItem.appendChild(checkbox);
    checkboxItem.appendChild(textSpan);
    checkboxList.appendChild(checkboxItem);

    // Focus on the text span
    const newRange = document.createRange();
    newRange.setStart(textSpan, 0);
    newRange.setEnd(textSpan, 0);
    selection.removeAllRanges();
    selection.addRange(newRange);
    textSpan.focus();
  }

  // Handle checkbox interactions and Enter key for new items
  editor.addEventListener('click', (e) => {
    if (e.target.type === 'checkbox') {
      e.stopPropagation();
    } else if (e.target.classList.contains('checkbox-text')) {
      // If clicking an empty checkbox-text span, ensure cursor is at the beginning
      if (e.target.textContent.trim() === '') {
        const selection = window.getSelection();
        const range = document.createRange();
        range.setStart(e.target, 0);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  });

  editor.addEventListener('keydown', (e) => {
    // Handle Enter key in checkbox items
    if (e.key === 'Enter') {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const textSpan = range.startContainer.parentElement.closest('.checkbox-text');

      if (textSpan) {
        e.preventDefault();

        // Get current text before the cursor
        const preText = textSpan.textContent.substring(0, range.startOffset);
        const postText = textSpan.textContent.substring(range.startOffset);

        // Update current item's text
        textSpan.textContent = preText; // Keep text before cursor in current item

        const checkboxList = textSpan.closest('.checkbox-list');
        const currentItem = textSpan.closest('.checkbox-item');

        const newItem = document.createElement('li');
        newItem.className = 'checkbox-item';

        const newCheckbox = document.createElement('input');
        newCheckbox.type = 'checkbox';
        newCheckbox.addEventListener('change', function() {
          const item = this.parentElement;
          if (this.checked) {
            item.classList.add('checked');
          } else {
            item.classList.remove('checked');
          }
          saveDocument();
        });

        const newTextSpan = document.createElement('span');
        newTextSpan.className = 'checkbox-text';
        newTextSpan.contentEditable = 'true';
        newTextSpan.textContent = postText; // Carry over text after cursor, or empty
        newTextSpan.setAttribute('data-placeholder', 'List item');

        newItem.appendChild(newCheckbox);
        newItem.appendChild(newTextSpan);
        checkboxList.insertBefore(newItem, currentItem.nextSibling);

        // Focus on new item
        const newRange = document.createRange();
        newRange.setStart(newTextSpan, 0);
        newRange.setEnd(newTextSpan, 0);
        selection.removeAllRanges();
        selection.addRange(newRange);
        newTextSpan.focus();
      }
    }
  });

  // Expose minimal API
  window.editorApi = {
    loadDocument,
    saveDocument,
    getCurrentDocId: () => currentDocId, // Expose currentDocId
    setFocusMode, // Expose setFocusMode
  };
})();


