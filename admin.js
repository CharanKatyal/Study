
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
const pathInput = document.getElementById('explorer-path-input');
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

function showExplorerView() {
    editorSection.classList.add('hidden');
    explorerSection.style.display = 'flex';
    renderExplorer();
}

function showEditorView() {
    explorerSection.style.display = 'none';
    editorSection.classList.remove('hidden');
}

// --- Core Navigation and Rendering ---

function renderExplorer() {
    pathInput.value = currentPath;
    explorerView.innerHTML = '';
    selectedItem.path = null;

    const currentNode = getNode(currentPath);
    if (!currentNode || typeof currentNode !== 'object') {
        explorerView.innerHTML = '<p>Path not found.</p>';
        return;
    }

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

function handleSelection(path, isFolder) {
    selectedItem = { path, isFolder };
    document.querySelectorAll('.explorer-item').forEach(el => el.classList.remove('selected'));
    const selectedEl = document.querySelector(`[data-path="${path}"]`);
    if (selectedEl) selectedEl.classList.add('selected');
}

function handleDoubleClick(path, isFolder) {
    if (isFolder) {
        currentPath = path;
        renderExplorer();
    } else {
        openEditorForFile(path);
    }
}

function navigateBack() {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').slice(0, -1);
    currentPath = parts.length > 1 ? parts.join('/') : '/';
    renderExplorer();
}

function navigateToPath(path) {
    const node = getNode(path);
    if (node && typeof node === 'object' && !node.hasOwnProperty('content')) {
        currentPath = path;
        renderExplorer();
    } else {
        alert('Invalid directory path.');
        pathInput.value = currentPath; // Reset to valid path
    }
}

// --- File and Folder Data Manipulation ---

function getNode(path) {
    if (path === '/') return fileSystem;
    const parts = path.startsWith('/') ? path.split('/').slice(1) : path.split('/');
    let current = fileSystem;
    for (const part of parts) {
        if (part === '') continue;
        if (!current || !current.hasOwnProperty(part)) return null;
        current = current[part];
    }
    return current;
}

function openEditorForFile(path) {
    const node = getNode(path);
    if (node && node.hasOwnProperty('content')) {
        editorPathInput.value = path;
        quill.root.innerHTML = node.content || '';
        showEditorView();
    } else {
        alert('This item is not a file.');
    }
}

// --- Event Listeners ---

pathInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        navigateToPath(e.target.value);
    }
});

backBtn.addEventListener('click', navigateBack);
backToExplorerBtn.addEventListener('click', showExplorerView);

createFolderBtn.addEventListener('click', () => {
    const folderName = prompt('Enter new folder name:');
    if (!folderName || !folderName.trim()) return;
    const parentNode = getNode(currentPath);
    if (parentNode && !parentNode[folderName]) {
        parentNode[folderName] = {};
        renderExplorer();
    } else {
        alert('An item with this name already exists here.');
    }
});

createFileBtn.addEventListener('click', () => {
    const fileName = prompt('Enter new file name (e.g., about.txt):');
    if (!fileName || !fileName.trim()) return;
    const parentNode = getNode(currentPath);
    if (parentNode && !parentNode[fileName]) {
        parentNode[fileName] = { content: '<p>New file content...</p>' };
        renderExplorer();
    } else {
        alert('An item with this name already exists here.');
    }
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
            renderExplorer();
        }
    }
});

saveFileBtn.addEventListener('submit', (e) => {
    e.preventDefault();
    const path = editorPathInput.value;
    const node = getNode(path);
    if (node) {
        node.content = quill.root.innerHTML;
        showExplorerView();
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
        const jsonString = text.replace('export const fileSystemData = ', '').replace(/;\s*$/, '');
        fileSystem = JSON.parse(jsonString);
        showExplorerView();
    } catch (error) {
        console.error('Failed to load initial content data:', error);
        explorerView.innerHTML = '<p style="color: red;">Error loading content data.</p>';
    }
}

initializeAdminPanel();
