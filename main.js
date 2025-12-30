
const classes = [
    { name: 'Class 1', icon: 'fa-child' },
    { name: 'Class 2', icon: 'fa-shapes' },
    { name: 'Class 3', icon: 'fa-calculator' },
    { name: 'Class 4', icon: 'fa-atom' },
    { name: 'Class 5', icon: 'fa-book-open' },
    { name: 'Class 6', icon: 'fa-globe-americas' },
    { name: 'Class 7', icon: 'fa-flask' },
    { name: 'Class 8', icon: 'fa-landmark' },
    { name: 'Class 9', icon: 'fa-microscope' },
    { name: 'Class 10', icon: 'fa-square-root-alt' },
    { name: 'Class 11', icon: 'fa-chart-line' },
    { name: 'Class 12', icon: 'fa-code' },
];

const classSelection = document.querySelector('.class-selection');

classes.forEach(cls => {
    const card = document.createElement('div');
    card.className = 'class-card';
    card.innerHTML = `
        <i class="fas ${cls.icon} fa-3x"></i>
        <h2>${cls.name}</h2>
    `;
    classSelection.appendChild(card);
});
