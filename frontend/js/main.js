(function () {
  const sidebar = document.getElementById("sidebar");
  const toggleSidebarBtn = document.getElementById("toggle-sidebar");
  const newDocumentButton = document.getElementById("new-document-button");
  const documentListContainer = document.getElementById("document-list");

  // Sidebar toggle
  toggleSidebarBtn.addEventListener("click", () => {
    sidebar.classList.toggle("hidden");
  });

  // Initialize document manager
  window.addEventListener("DOMContentLoaded", () => {
    docManager.init(documentListContainer, newDocumentButton);
  });
})();


