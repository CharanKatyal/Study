
import { fileSystemData } from './content-data.js';

const sidebarContent = document.getElementById('sidebar-content');
const contentTitle = document.getElementById('content-title');
const contentBody = document.getElementById('content-body');
const welcomeMessage = document.getElementById('welcome-message');
const contentDisplay = document.getElementById('content-display');

/**
 * Recursively builds the navigation menu from the file system data.
 */
function buildNavMenu(parentObject, parentElement) {
    const sortedEntries = Object.entries(parentObject).sort((a, b) => {
        const aIsFolder = typeof a[1] === 'object' && !a[1].hasOwnProperty('content');
        const bIsFolder = typeof b[1] === 'object' && !b[1].hasOwnProperty('content');
        if (aIsFolder && !bIsFolder) return -1;
        if (!aIsFolder && bIsFolder) return 1;
        return a[0].localeCompare(b[0]);
    });

    for (const [name, node] of sortedEntries) {
        const isFolder = typeof node === 'object' && !node.hasOwnProperty('content');
        const path = parentElement.dataset.path ? `${parentElement.dataset.path}/${name}` : name;

        const navItem = document.createElement('div');
        navItem.className = isFolder ? 'nav-folder' : 'nav-file';
        navItem.dataset.path = path;

        const itemHeader = document.createElement('div');
        itemHeader.className = 'nav-item';
        itemHeader.innerHTML = `
            <i class="fas ${isFolder ? 'fa-folder' : 'fa-file-alt'}"></i>
            <span>${name}</span>
        `;

        navItem.appendChild(itemHeader);
        parentElement.appendChild(navItem);

        if (isFolder) {
            itemHeader.addEventListener('click', () => {
                navItem.classList.toggle('open');
            });

            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'nav-children';
            childrenContainer.dataset.path = path; 
            navItem.appendChild(childrenContainer);
            buildNavMenu(node, childrenContainer);
        } else {
            itemHeader.addEventListener('click', () => {
                displayContent(path);
                document.querySelectorAll('.nav-item.active').forEach(el => el.classList.remove('active'));
                itemHeader.classList.add('active');
            });
        }
    }
}

/**
 * Displays the content of a file in the main content area.
 */
function displayContent(path) {
    const node = getNodeFromPath(path);
    if (node && node.content) {
        welcomeMessage.classList.add('hidden');
        contentDisplay.classList.remove('hidden');
        contentTitle.textContent = path.split('/').pop();
        contentBody.innerHTML = node.content;
    } else {
        welcomeMessage.classList.add('hidden');
        contentDisplay.classList.remove('hidden');
        contentTitle.textContent = 'Not Found';
        contentBody.innerHTML = '<p>The selected file could not be found or has no content.</p>';
    }
}

/**
 * Retrieves a node from the file system data using a path string.
 */
function getNodeFromPath(path) {
    const parts = path.split('/');
    let current = fileSystemData;
    for (const part of parts) {
        if (current && current[part]) {
            current = current[part];
        } else {
            return null;
        }
    }
    return current;
}

// Initial setup
function initialize() {
    if (Object.keys(fileSystemData).length > 0) {
        buildNavMenu(fileSystemData, sidebarContent);
    } else {
        welcomeMessage.querySelector('p').textContent = 'No content has been published yet. Please use the admin panel to create and publish content.';
    }
}


initialize();
