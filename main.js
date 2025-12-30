// The file system data is now loaded from the global window object, 
// injected by the server-side index.php script.
const fileSystem = window.fileSystemData;

// DOM Elements
const explorerView = document.getElementById('explorer-view');
const contentTitle = document.getElementById('content-title');
const contentBody = document.getElementById('content-body');

/**
 * Renders the file explorer view.
 * It sorts entries to show folders first, then files, both alphabetically.
 */
function renderExplorer() {
    explorerView.innerHTML = ''; // Clear the existing view

    function renderLevel(parentObject, pathPrefix) {
        const container = document.createElement('div');
        if (pathPrefix) {
            container.style.paddingLeft = '20px';
        }

        // Sort entries: folders first, then files, both alphabetically
        const sortedEntries = Object.entries(parentObject).sort((a, b) => {
            const aIsFolder = typeof a[1] === 'object' && !a[1].hasOwnProperty('content');
            const bIsFolder = typeof b[1] === 'object' && !b[1].hasOwnProperty('content');

            if (aIsFolder && !bIsFolder) return -1; // a (folder) comes before b (file)
            if (!aIsFolder && bIsFolder) return 1;  // b (folder) comes before a (file)
            return a[0].localeCompare(b[0]);       // sort alphabetically
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

            // Add a click listener to handle file selection
            itemEl.addEventListener('click', (e) => {
                e.stopPropagation();
                handleFileSelection(currentPath);
            });

            container.appendChild(itemEl);

            // If the node is a folder, recursively render its contents
            if (isFolder) {
                container.appendChild(renderLevel(node, currentPath));
            }
        }
        return container;
    }

    // Start rendering from the root of the file system
    explorerView.appendChild(renderLevel(fileSystem, ''));
}

/**
 * Handles the logic when a user clicks on a file in the explorer.
 * @param {string} path - The path of the selected file.
 */
function handleFileSelection(path) {
    const node = getNodeFromPath(path);
    const isFolder = typeof node === 'object' && !node.hasOwnProperty('content');

    // Only update the content view if a file is clicked, not a folder
    if (node && !isFolder) {
        contentTitle.innerHTML = `<i class="fas fa-file-alt"></i> ${path.split('/').pop()}`;
        contentBody.innerHTML = node.content || '<p>This file is empty.</p>';

        // Highlight the selected file in the explorer
        document.querySelectorAll('.explorer-item').forEach(el => el.classList.remove('selected'));
        const selectedEl = document.querySelector(`[data-path="${path}"]`);
        if (selectedEl) {
            selectedEl.classList.add('selected');
        }
    }
}

/**
 * Retrieves a node (file or folder) from the file system using its path.
 * @param {string} path - The path of the node to retrieve (e.g., "Class 1/Notes.md")
 * @returns {object|null} The node object or null if not found.
 */
function getNodeFromPath(path) {
    if (!path) return null;
    const parts = path.split('/');
    let current = fileSystem;
    for (const part of parts) {
        if (current && typeof current === 'object' && current.hasOwnProperty(part)) {
            current = current[part];
        } else {
            return null; // Path does not exist
        }
    }
    return current;
}

// --- Initial Load ---
// Render the explorer as soon as the script loads.
// The initial content is already rendered on the server.
renderExplorer();
