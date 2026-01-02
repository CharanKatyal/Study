import { fileSystemData } from './content-data.js';

document.addEventListener('DOMContentLoaded', () => {
    const itemsContainer = document.getElementById('items-container');
    const browserView = document.getElementById('browser-view');
    const contentView = document.getElementById('content-view');
    const postContent = document.getElementById('post-content');
    const backBtn = document.getElementById('back-btn');
    const headerTitle = document.getElementById('header-title');

    const navigationStack = [];

    // Maps specific folder names to Font Awesome icons
    const iconMap = {
        'Class 9': 'fa-book',
        'Class 10': 'fa-graduation-cap',
        'Class 11': 'fa-atom',
        'Class 12': 'fa-flask',
        // Default icons
        'folder': 'fa-folder',
        'file': 'fa-file-alt'
    };

    function isFolder(item) {
        return typeof item === 'object' && item !== null && !item.hasOwnProperty('content');
    }

    function getIconClass(name, item) {
        if (isFolder(item)) {
            return iconMap[name] || iconMap['folder'];
        }
        return iconMap['file'];
    }

    function render(path) {
        let currentData = fileSystemData;
        const pathParts = path.split('/').filter(p => p);

        for (const part of pathParts) {
            if (currentData && typeof currentData === 'object' && currentData.hasOwnProperty(part)) {
                currentData = currentData[part];
            } else {
                console.error('Invalid path', path);
                return;
            }
        }

        itemsContainer.innerHTML = '';
        browserView.classList.remove('hidden');
        contentView.classList.add('hidden');

        for (const [name, item] of Object.entries(currentData)) {
            const button = document.createElement('button');
            button.className = 'item-button';
            button.classList.add(`item-${name.toLowerCase().replace(/ /g, '-')}`);

            const icon = document.createElement('i');
            icon.className = `fas ${getIconClass(name, item)}`;

            const buttonText = document.createTextNode(name.replace(/\.(link|txt)$/, ''));

            button.appendChild(icon);
            button.appendChild(buttonText);

            button.addEventListener('click', () => {
                if (isFolder(item)) {
                    navigationStack.push(path);
                    render(path === '/' ? `/${name}` : `${path}/${name}`);
                } else if (name.endsWith('.link')) {
                    window.open(item.content.replace(/<[^>]*>/g, ''), '_blank');
                } else {
                    navigationStack.push(path);
                    renderContent(item.content, name);
                }
            });

            itemsContainer.appendChild(button);
        }

        updateUI(path);
    }

    function renderContent(content, name) {
        browserView.classList.add('hidden');
        contentView.classList.remove('hidden');
        postContent.innerHTML = content;
        updateUI(name);
    }

    function updateUI(path) {
        if (navigationStack.length > 0) {
            backBtn.classList.remove('hidden');
        } else {
            backBtn.classList.add('hidden');
        }

        const title = path === '/' ? 'Home' : path.split('/').pop();
        headerTitle.textContent = title.replace(/\.(link|txt)$/, '');
    }

    backBtn.addEventListener('click', () => {
        const path = navigationStack.pop();
        render(path || '/');
        contentView.classList.add('hidden');
        browserView.classList.remove('hidden');
    });

    // Initial render
    render('/');
});