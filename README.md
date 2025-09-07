# Co-Write: Collaborative Text Editor

## 1. Product Overview

Co-Write is a lightweight, collaborative text editor designed for real-time document editing and sharing. This project is being developed in phases, starting with a local-first rich text editor, and later incorporating real-time collaboration features.

## 2. Technology Stack (Frontend - Phase 1)

*   **Frontend**: HTML5, CSS3, JavaScript (ES6+)
*   **Data Persistence**: localStorage

## 3. How to Run (Phase 1 Frontend)

To run the current frontend application, follow these simple steps:

1.  **Navigate to the project root** in your terminal:
    ```bash
    cd /Users/0xmanavsingh/dev/one-address/co-write
    ```
2.  **Open the `index.html` file in your browser**:
    You can do this by:
    *   Double-clicking the `frontend/index.html` file in your file explorer (Finder on macOS, Explorer on Windows).
    *   Dragging and dropping the `frontend/index.html` file onto your preferred web browser (Chrome, Firefox, Safari, Edge).
    *   Using the `open` command in your terminal (macOS/Linux):
        ```bash
        open frontend/index.html
        ```
    *   (Optional) Using a simple Python HTTP server from the `frontend` directory for a proper `http://` protocol:
        ```bash
        cd frontend
        python3 -m http.server 8000
        # Then, open http://localhost:8000 in your browser
        ```

## 4. Current Status (Phase 1 Progress)

We have completed the foundational elements of Phase 1, the local text editor:

*   **Core Editor Features**:
    *   Rich text formatting (Bold, Italic, Underline, Headings, Lists, Strikethrough)
    *   Interactive checkbox lists with strike-through functionality
    *   Basic keyboard shortcuts (e.g., Cmd/Ctrl+B, Cmd/Ctrl+I, Cmd/Ctrl+U, Cmd/Ctrl+S, Cmd/Ctrl+Shift+8 for bullet points, Cmd/Ctrl+Shift+9 for checkbox lists)
    *   Live word count display
    *   Light/Dark theme toggle
*   **Document Management (Initial)**:
    *   Sidebar with a list of documents
    *   Ability to create new documents
    *   Load existing documents
    *   Delete and duplicate documents from the list
    *   Document search and sort functionality (by last modified, title, word count, creation date)
    *   Auto-save and manual save (`Cmd/Ctrl+S`) with a visual indicator
*   **Data Persistence**: All documents and settings are saved locally using `localStorage`.
*   **User Interface**: Responsive design with a clean, distraction-free writing experience.

## 5. Next Steps

Remaining tasks for Phase 1 include:

*   Implement Focus Mode
*   Implement Data Export/Import and Backup
*   Sanitize HTML content and validate inputs

## 6. Development Notes

*   The application is designed to be lightweight and accessible without requiring account creation.
*   Keyboard shortcuts are implemented for enhanced productivity.
*   Basic styling for modern web browsers has been applied.

---
