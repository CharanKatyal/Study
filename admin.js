
// A simple polling function to wait for global libraries that are not modules
function waitForGlobals(globals) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 100; // Wait for a maximum of 10 seconds

        const check = () => {
            // Check for BlotFormatter specifically
            if (globals.every(g => window[g]) && window.QuillBlotFormatter) {
                resolve();
            } else {
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(check, 100); // Check every 100ms
                } else {
                    reject(new Error(`Timed out waiting for globals: ${globals.join(', ')}`))
                }
            }
        };
        check();
    });
}

// Main function to orchestrate the application startup
async function main() {
    try {
        // Step 1: Wait for Quill and the new BlotFormatter library
        await waitForGlobals(['Quill']);

        // Step 2: Dynamically import the file system data module.
        const dataModule = await import(`./content-data.js?v=${new Date().getTime()}`);
        let fileSystem = dataModule.fileSystemData;

        // --- DOM Elements ---
        const explorerSection = document.getElementById('explorer-section');
        const editorSection = document.getElementById('editor-section');
        const explorerView = document.getElementById('explorer-view');
        const pathInput = document.getElementById('explorer-path-input');
        const editorPathInput = document.getElementById('current-path-display');

        // --- Buttons ---
        const backBtn = document.getElementById('explorer-back-btn');
        const editorBackBtn = document.getElementById('editor-back-btn');
        const createFolderBtn = document.getElementById('create-folder-btn');
        const createFileBtn = document.getElementById('create-file-btn');
        const deleteBtn = document.getElementById('delete-btn');
        const moveUpBtn = document.getElementById('move-up-btn');
        const moveDownBtn = document.getElementById('move-down-btn');
        const publishBtn = document.getElementById('publish-btn');
        const saveFileBtn = document.getElementById('file-editor-form');
        const backToExplorerBtn = document.getElementById('back-to-explorer-btn');

        // --- Global State ---
        let currentPath = '/';
        let selectedItem = { path: null, isFolder: false };

        // --- Quill Editor Initialization with Blot Formatter for resizing ---
        Quill.register('modules/blotFormatter', window.QuillBlotFormatter.default);
        const quill = new Quill('#editor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'script': 'sub'}, { 'script': 'super' }],
                    [{ 'header': 1 }, { 'header': 2 }, 'blockquote', 'code-block'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
                    [{ 'direction': 'rtl' }, { 'align': [] }],
                    ['link', 'image', 'video', 'formula'],
                    ['clean']
                ],
                blotFormatter: {
                    // No options needed for basic image and video resizing
                }
            }
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
                explorerView.innerHTML = `<p style="color: orange;">Path not found: "${currentPath}".</p>`;
                return;
            }
            // We no longer sort. We will render in the order they appear in the object.
            const entries = Object.entries(currentNode);
            if (entries.length === 0) {
                explorerView.innerHTML = '<p>This folder is empty.</p>';
            }
            for (const [name, node] of entries) {
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
            if (!node) {
                alert('Invalid path.');
                pathInput.value = currentPath;
                return;
            }
            const isFolder = typeof node === 'object' && !node.hasOwnProperty('content');
            if (isFolder) {
                currentPath = path;
                showExplorerView();
            } else {
                openEditorForFile(path);
            }
        }
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
                alert('This item is not a file or does not exist.');
            }
        }
        // --- Item Reordering ---
        function moveItem(direction) {
            if (!selectedItem.path) {
                alert('Please select an item to move.');
                return;
            }
            const parentPath = currentPath;
            const parentNode = getNode(parentPath);
            const itemName = selectedItem.path.split('/').pop();
            const keys = Object.keys(parentNode);
            const currentIndex = keys.indexOf(itemName);

            if (direction === 'up' && currentIndex > 0) {
                const newKeys = [...keys];
                [newKeys[currentIndex - 1], newKeys[currentIndex]] = [newKeys[currentIndex], newKeys[currentIndex - 1]];
                reorderFileSystemNode(parentNode, newKeys);
                renderExplorer();
            } else if (direction === 'down' && currentIndex < keys.length - 1) {
                const newKeys = [...keys];
                [newKeys[currentIndex + 1], newKeys[currentIndex]] = [newKeys[currentIndex], newKeys[currentIndex + 1]];
                reorderFileSystemNode(parentNode, newKeys);
                renderExplorer();
            }
        }

        function reorderFileSystemNode(node, orderedKeys) {
            const newNode = {};
            for (const key of orderedKeys) {
                newNode[key] = node[key];
                delete node[key]; // Remove the old key
            }
            // Add the keys back in the new order
            for (const key of orderedKeys) {
                node[key] = newNode[key];
            }
        }
        // --- Event Listeners ---
        pathInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); navigateToPath(e.target.value.trim()); } });
        editorPathInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); navigateToPath(e.target.value.trim()); } });
        backBtn.addEventListener('click', navigateBack);
        editorBackBtn.addEventListener('click', () => { const path = editorPathInput.value; if (!path) return; const parts = path.split('/'); parts.pop(); currentPath = parts.join('/') || '/'; showExplorerView(); });
        backToExplorerBtn.addEventListener('click', showExplorerView);
        createFolderBtn.addEventListener('click', () => { const folderName = prompt('Enter folder name:'); if (!folderName) return; const parentNode = getNode(currentPath); if (!parentNode[folderName]) { parentNode[folderName] = {}; renderExplorer(); } else { alert('Item exists.'); } });
        createFileBtn.addEventListener('click', () => { const fileName = prompt('Enter file name:'); if (!fileName) return; const parentNode = getNode(currentPath); if (!parentNode[fileName]) { parentNode[fileName] = { content: '' }; renderExplorer(); } else { alert('Item exists.'); } });
        deleteBtn.addEventListener('click', () => { if (!selectedItem.path || !confirm(`Delete "${selectedItem.path}"?`)) return; const parts = selectedItem.path.split('/'); const nodeName = parts.pop(); const parentNode = getNode(parts.join('/') || '/'); if (parentNode && parentNode.hasOwnProperty(nodeName)) { delete parentNode[nodeName]; renderExplorer(); } });
        moveUpBtn.addEventListener('click', () => moveItem('up'));
        moveDownBtn.addEventListener('click', () => moveItem('down'));
        saveFileBtn.addEventListener('submit', (e) => { e.preventDefault(); const path = editorPathInput.value; const node = getNode(path); if (node) { node.content = quill.root.innerHTML; const parts = path.split('/'); parts.pop(); currentPath = parts.join('/') || '/'; showExplorerView(); } else { alert('Save error.'); } });
        publishBtn.addEventListener('click', async () => { const formData = new URLSearchParams(); formData.append('content', JSON.stringify(fileSystem, null, 2)); try { const response = await fetch('publish.php', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: formData }); alert((await response.json()).message); } catch (error) { console.error('Publish error:', error); alert('Publish failed.'); } });

        // --- Initial Render ---
        showExplorerView();

    } catch (error) {
        console.error("Fatal startup error:", error);
        const errorContainer = document.getElementById('explorer-view') || document.body;
        errorContainer.innerHTML = `<p style="color: red; font-weight: bold;">Fatal Error: ${error.message}. Check console for details.</p>`;
    }
}

// --- Run the main application ---
main();
