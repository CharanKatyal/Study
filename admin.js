
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

const form = document.querySelector('#content-form form');
const contentList = document.querySelector('#content-list');

const sampleContent = [
    { class: 'Class 1', subject: 'Alphabet', content: '<p>A is for Apple, B is for Ball...</p>' },
    { class: 'Class 2', subject: 'Shapes', content: '<p>A square has 4 equal sides.</p>' },
];

function displayContent() {
    contentList.innerHTML = '<h2>Existing Content</h2>';
    sampleContent.forEach(item => {
        const div = document.createElement('div');
        div.className = 'content-item';
        div.innerHTML = `
            <h3>${item.class} - ${item.subject}</h3>
            <div class="content-body">${item.content}</div>
        `;
        contentList.appendChild(div);
    });
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newContent = {
        class: form.class.value,
        subject: form.subject.value,
        content: quill.root.innerHTML, // Get HTML content from editor
    };

    console.log('New Content Added:', newContent);
    
    sampleContent.push(newContent);
    displayContent();

    // Reset form and editor
    form.reset();
    quill.setText('');
});

displayContent();
