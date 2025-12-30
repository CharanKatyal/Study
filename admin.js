
import { fileSystemData } from './content-data.js';

// Initialize Quill Editor
const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'image'],
            ['clean']
        ]
    }
});

// DOM Elements
const explorerView = document.getElementById('explorer-view');
const editorSection = document.getElementById('editor-section');
const currentPathInput = document.getElementById('current-path');
const createFolderBtn = document.getElementById('create-folder-btn');
const createFileBtn = document.getElementById('create-file-btn');
const deleteBtn = document.getElementById('delete-btn');
const fileEditorForm = document.getElementById('file-editor-form');
const closeEditorBtn = document.getElementById('close-editor-btn');
const publishCommandOutput = document.getElementById('publish-command-output');


// In-memory representation of the file system
let fileSystem = {};

// Load initial data
function loadFileSystem() {
    fileSystem = JSON.parse(JSON.stringify(fileSystemData));
    for (let i = 1; i <= 12; i++) {
        const className = `Class ${i}`;
        if (!fileSystem[className]) {
            fileSystem[className] = {};
        }
    }
}

let selectedPath = null;

function getNode(path) {
    if (!path) return fileSystem;
    const parts = path.split('/');
    let current = fileSystem;
    for (const part of parts) {
        if (current && typeof current === 'object' && current.hasOwnProperty(part)) {
            current = current[part];
        } else {
            return null;
        }
    }
    return current;
}

function renderExplorer() {
    explorerView.innerHTML = '';

    function renderLevel(parentObject, pathPrefix) {
        const container = document.createElement('div');
        if (pathPrefix) {
            container.style.paddingLeft = '20px';
        }

        const sortedEntries = Object.entries(parentObject).sort((a, b) => {
            const aIsFolder = typeof a[1] === 'object' && !a[1].hasOwnProperty('content');
            const bIsFolder = typeof b[1] === 'object' && !b[1].hasOwnProperty('content');
            if (aIsFolder && !bIsFolder) return -1;
            if (!aIsFolder && bIsFolder) return 1;
            return a[0].localeCompare(b[0]);
        });

        for (const [name, node] of sortedEntries) {
            const currentPath = pathPrefix ? `${pathPrefix}/${name}` : name;
            const isFolder = typeof node === 'object' && !node.hasOwnProperty('content');

            const itemEl = document.createElement('div');
            itemEl.className = 'explorer-item';
            itemEl.dataset.path = currentPath;
            itemEl.innerHTML = `
                <i class="fas ${isFolder ? 'fa-folder' : 'fa-file-alt'}"></i>
                <span>${name}</span>
            `;

            itemEl.addEventListener('click', (e) => {
                e.stopPropagation();
                handleSelection(currentPath);
            });

            if (!isFolder) {
                itemEl.addEventListener('dblclick', (e) => {
                    e.stopPropagation();
                    openEditorForPath(currentPath);
                });
            }
            
            container.appendChild(itemEl);

            if (isFolder) {
                container.appendChild(renderLevel(node, currentPath));
            }
        }
        return container;
    }
    explorerView.appendChild(renderLevel(fileSystem, ''));

    if (selectedPath) {
        const selectedEl = document.querySelector(`[data-path="${selectedPath}"]`);
        if (selectedEl) {
            selectedEl.classList.add('selected');
        }
    }
}

function handleSelection(path) {
    selectedPath = path;
    document.querySelectorAll('.explorer-item').forEach(el => el.classList.remove('selected'));
    const selectedEl = document.querySelector(`[data-path="${path}"]`);
    if (selectedEl) {
        selectedEl.classList.add('selected');
    }
}

function openEditorForPath(path) {
    const node = getNode(path);
    const isFolder = typeof node === 'object' && !node.hasOwnProperty('content');
    
    if (node && !isFolder) {
        handleSelection(path); 
        currentPathInput.value = path;
        quill.root.innerHTML = node.content || '';
        editorSection.classList.remove('hidden');
    }
}

function closeEditor() {
    editorSection.classList.add('hidden');
    quill.setText('');
    currentPathInput.value = '';
}

function getParentForNewItem() {
    if (!selectedPath) return fileSystem;
    let parentNode = getNode(selectedPath);
    const isSelectedFolder = parentNode && typeof parentNode === 'object' && !parentNode.hasOwnProperty('content');
    if (!isSelectedFolder) {
        const parentPath = selectedPath.split('/').slice(0, -1).join('/');
        return getNode(parentPath) || fileSystem;
    }
    return parentNode || fileSystem;
}

/**
 * Generates the command to publish changes and displays it.
 */
function generatePublishCommand() {
    const fileContent = `export const fileSystemData = ${JSON.stringify(fileSystem, null, 4)};`;
    const escapedContent = fileContent.replaceAll("'''", "''\'");
    const command = `print(default_api.write_file(path='content-data.js', content='''${escapedContent}'''))`;
    publishCommandOutput.value = command;
    publishCommandOutput.select();
}

// --- Event Listeners ---

createFolderBtn.addEventListener('click', () => {
    const folderName = prompt('Enter new folder name:');
    if (folderName && folderName.trim()) {
        const parentNode = getParentForNewItem();
        if (parentNode[folderName]) {
            alert('An item with this name already exists here.');
            return;
        }
        parentNode[folderName] = {};
        renderExplorer();
        generatePublishCommand(); // Also generate on structural changes
        alert('Folder created. Publish command updated.');
    }
});

createFileBtn.addEventListener('click', () => {
    const fileName = prompt('Enter new file name (e.g., about.txt):');
    if (fileName && fileName.trim()) {
        const parentNode = getParentForNewItem();
        if (parentNode[fileName]) {
            alert('An item with this name already exists here.');
            return;
        }
        parentNode[fileName] = { content: '<p>New file content...</p>' };
        renderExplorer();
        generatePublishCommand(); // Also generate on structural changes
        alert('File created. Publish command updated.');
    }
});

deleteBtn.addEventListener('click', () => {
    if (!selectedPath) {
        alert('Please select an item to delete.');
        return;
    }
    if (confirm(`Are you sure you want to delete "${selectedPath}"?`)) {
        const parts = selectedPath.split('/');
        const nodeName = parts.pop();
        const parentPath = parts.join('/');
        const parentNode = getNode(parentPath);

        if (parentNode && parentNode.hasOwnProperty(nodeName)) {
            delete parentNode[nodeName];
            if (selectedPath === currentPathInput.value) {
                closeEditor();
            }
            selectedPath = null;
            renderExplorer();
            generatePublishCommand(); // Also generate on structural changes
            alert('Item deleted. Publish command updated.');
        }
    }
});

fileEditorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pathToSave = currentPathInput.value;
    if (!pathToSave) {
        alert('No file is open for saving.');
        return;
    }
    const node = getNode(pathToSave);
    if (node) {
        node.content = quill.root.innerHTML;
        generatePublishCommand();
        alert(`Content for "${pathToSave}" saved successfully! Publish command is updated.`);
    } else {
        alert('Error: Could not find the file to save.');
    }
});

closeEditorBtn.addEventListener('click', closeEditor);

// Initial Load
loadFileSystem();
renderExplorer();
