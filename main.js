import { contentData } from './content-data.js';

document.addEventListener('DOMContentLoaded', () => {
    const classGrid = document.querySelector('.class-grid');

    if (classGrid) {
        // Create a card for each class in the content data
        for (const classId in contentData) {
            const classInfo = contentData[classId];
            const card = document.createElement('div');
            card.className = 'class-card';
            card.innerHTML = `
                <i class="fas fa-school"></i>
                <h3>${classInfo.name}</h3>
            `;
            card.addEventListener('click', () => {
                // Handle class selection
                console.log(`Selected class: ${classInfo.name}`);
            });
            classGrid.appendChild(card);
        }
    }
});
