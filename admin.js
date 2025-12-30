
// This script powers a single-page file explorer and editor.
// It manages the UI to switch between an explorer view and a text editor view.

// --- Global State ---
let fileSystem = {}; // In-memory copy of all file and folder data.
let currentPath = '/'; // The current directory being viewed in the explorer.
let selectedItem = { path: null, isFolder: false }; // The currently highlighted item.

// --- DOM Elements ---
const explorerSection = document.getElementById('explorer-section');
const editorSection = document.getElementById('editor-section');
const explorerView = document.getElementById('explorer-view');
const explorerPathDiv = document.getElementById('explorer-path');
const editorPathInput = document.getElementById('current-path-display');

// --- Buttons ---
const backBtn = document.getElementById('explorer-back-btn');
const createFolderBtn = document.getElementById('create-folder-btn');
const createFileBtn = document.getElementById('create-file-btn');
const deleteBtn = document.getElementById('delete-btn');
const publishBtn = document.getElementById('publish-btn');
const saveFileBtn = document.getElementById('file-editor-form');
const backToExplorerBtn = document.getElementById('back-to-explorer-btn');

// --- Quill Editor Initialization ---
const quill = new Quill('#editor', {
    theme: 'snow',
    modules: { toolbar: [/* ... full toolbar options ... */] }
});

// --- UI View Management ---

/** Switches the view to the file explorer. */
function showExplorerView() {
    editorSection.classList.add('hidden');
    explorerSection.classList.remove('hidden');
    renderExplorer(); // Re-render the explorer for the current path
}

/** Switches the view to the file editor. */
function showEditorView() {
    explorerSection.classList.add('hidden');
    editorSection.classList.remove('hidden');
}

// --- Core Navigation and Rendering ---

/** Renders the files and folders for the current directory path. */
function renderExplorer() {
    explorerView.innerHTML = ''; // Clear previous content
    explorerPathDiv.textContent = currentPath; // Update path display
    selectedItem.path = null; // Deselect any item

    const currentNode = getNode(currentPath);
    if (!currentNode || typeof currentNode !== 'object') return;

    const sortedEntries = Object.entries(currentNode).sort((a, b) => {
        const aIsFolder = typeof a[1] === 'object' && !a[1].content;
        const bIsFolder = typeof b[1] === 'object' && !b[1].content;
        if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;
        return a[0].localeCompare(b[0]);
    });

    for (const [name, node] of sortedEntries) {
        const isFolder = typeof node === 'object' && !node.hasOwnProperty('content');
        const itemPath = (currentPath === '/' ? '' : currentPath) + '/' + name;
        
        const itemEl = document.createElement('div');
        itemEl.className = 'explorer-item';
        itemEl.dataset.path = itemPath;
        itemEl.innerHTML = `<i class="fas ${isFolder ? 'fa-folder' : 'fa-file-alt'}"></i><span>${name}</span>`;

        itemEl.addEventListener('click', () => handleSelection(itemPath, isFolder));
        itemEl.addEventListener('dblclick', () => handleDoubleClick(itemPath, isFolder));
        explorerView.appendChild(itemEl);
    }
}

/** Handles single-clicking an item to select it. */
function handleSelection(path, isFolder) {
    selectedItem = { path, isFolder };
    document.querySelectorAll('.explorer-item').forEach(el => el.classList.remove('selected'));
    const selectedEl = document.querySelector(`[data-path="${path}"]`);
    if (selectedEl) selectedEl.classList.add('selected');
}

/** Handles double-clicking an item to navigate or open it. */
function handleDoubleClick(path, isFolder) {
    if (isFolder) {
        currentPath = path;
        renderExplorer();
    } else {
        openEditorForFile(path);
    }
}

/** Navigates one level up in the folder hierarchy. */
function navigateBack() {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').slice(0, -1);
    currentPath = parts.length > 1 ? parts.join('/') : '/';
    renderExplorer();
}

// --- File and Folder Data Manipulation ---

/** Retrieves a node (file or folder object) from the fileSystem based on its full path. */
function getNode(path) {
    if (path === '/') return fileSystem;
    const parts = path.split('/').slice(1);
    let current = fileSystem;
    for (const part of parts) {
        if (!current || !current.hasOwnProperty(part)) return null;
        current = current[part];
    }
    return current;
}

/** Opens the editor for a specific file path. */
function openEditorForFile(path) {
    const node = getNode(path);
    if (node && !node.hasOwnProperty('content')) return; // It's a folder

    editorPathInput.value = path; // Show path in editor
    quill.root.innerHTML = node.content || '';
    showEditorView();
}

// --- Event Listeners ---

backBtn.addEventListener('click', navigateBack);
backToExplorerBtn.addEventListener('click', showExplorerView);

createFolderBtn.addEventListener('click', () => {
    const folderName = prompt('Enter new folder name:');
    if (!folderName || !folderName.trim()) return;
    
    const parentNode = getNode(currentPath);
    if (parentNode[folderName]) {
        alert('An item with this name already exists here.');
        return;
    }
    parentNode[folderName] = {};
    renderExplorer();
});

createFileBtn.addEventListener('click', () => {
    const fileName = prompt('Enter new file name (e.g., about.txt):');
    if (!fileName || !fileName.trim()) return;

    const parentNode = getNode(currentPath);
    if (parentNode[fileName]) {
        alert('An item with this name already exists here.');
        return;
    }
    parentNode[fileName] = { content: '<p>New file content...</p>' };
    renderExplorer();
});

deleteBtn.addEventListener('click', () => {
    if (!selectedItem.path) {
        alert('Please select an item to delete.');
        return;
    }
    if (confirm(`Are you sure you want to delete "${selectedItem.path}"?`)) {
        const parts = selectedItem.path.split('/');
        const nodeName = parts.pop();
        const parentPath = parts.length > 1 ? parts.join('/') : '/';
        const parentNode = getNode(parentPath);

        if (parentNode && parentNode.hasOwnProperty(nodeName)) {
            delete parentNode[nodeName];
            renderExplorer(); // Refresh the view
        }
    }
});

saveFileBtn.addEventListener('submit', (e) => {
    e.preventDefault();
    const path = editorPathInput.value;
    const node = getNode(path);
    if (node) {
        node.content = quill.root.innerHTML;
        showExplorerView(); // Go back to explorer after saving
    } else {
        alert('Error: Could not find the file to save.');
    }
});

publishBtn.addEventListener('click', async () => {
    const content = JSON.stringify(fileSystem, null, 4);
    const formData = new URLSearchParams();
    formData.append('content', content);

    try {
        const response = await fetch('publish.php', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });
        const result = await response.json();
        alert(result.message);
    } catch (error) {
        console.error('Publishing error:', error);
        alert('A critical error occurred while publishing.');
    }
});

// --- Initial Application Load ---

async function initializeAdminPanel() {
    try {
        const response = await fetch('content-data.js');
        const text = await response.text();
        // This is a robust way to parse the JS file into a JSON object
        const jsonString = text.replace('export const fileSystemData = ', '').replace(/;\s*$/, '');
        fileSystem = JSON.parse(jsonString);
        showExplorerView();
    } catch (error) {
        console.error('Failed to load initial content data:', error);
        explorerView.innerHTML = '<p style="color: red;">Error loading content data. Please check the console.</p>';
    }
}

initializeAdminPanel();
