document.addEventListener('DOMContentLoaded', () => {
    // State
    let documents = [];

    // DOM Elements
    const documentsGrid = document.getElementById('documentsGrid');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadModal = document.getElementById('uploadModal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const searchInput = document.getElementById('searchInput');
    const totalDocsEl = document.getElementById('totalDocs');
    const recentDocsEl = document.getElementById('recentDocs');
    const viewerModal = document.getElementById('viewerModal');
    const pdfViewer = document.getElementById('pdfViewer');
    const viewerTitle = document.getElementById('viewerTitle');

    // Initialize
    loadDocuments();
    renderDocuments();
    updateStats();

    // Event Listeners
    uploadBtn.addEventListener('click', () => openModal(uploadModal));

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal);
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // File Upload Handling
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFiles(fileInput.files);
        }
    });

    // Search Handling
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = documents.filter(doc => doc.name.toLowerCase().includes(query));
        renderDocuments(filtered);
    });

    // Functions
    function loadDocuments() {
        if (window.initialDocuments && Array.isArray(window.initialDocuments)) {
            // Merge or set initial documents.
            // We'll iterate and add IDs since our scanner might not generate unique IDs (or we can just generate them here)
            const preloaded = window.initialDocuments.map(doc => ({
                ...doc,
                id: 'pre-' + Date.now() + Math.random(), // Unique ID for keying
                isLocal: true // Flag to identify these are from local folder
            }));

            // Add to the main list
            documents = [...preloaded, ...documents];
        }
    }

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (file.type === 'application/pdf') {
                const doc = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: formatSize(file.size),
                    date: new Date().toLocaleDateString(),
                    url: URL.createObjectURL(file), // Create blob URL
                    file: file
                };
                documents.unshift(doc); // Add to beginning
            } else {
                alert('Please upload PDF files only.');
            }
        });

        renderDocuments();
        updateStats();
        closeModal(uploadModal);
    }

    function renderDocuments(docsToRender = documents) {
        documentsGrid.innerHTML = '';

        if (docsToRender.length === 0) {
            documentsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-secondary);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                    <p>No documents found</p>
                    <p style="font-size: 0.9rem;">Upload a PDF to get started</p>
                </div>
            `;
            return;
        }

        docsToRender.forEach(doc => {
            const card = document.createElement('div');
            card.className = 'doc-card';
            card.innerHTML = `
                <div class="doc-preview">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><text x="12" y="18" text-anchor="middle" font-size="6" font-weight="bold" fill="currentColor">PDF</text></svg>
                </div>
                <div class="doc-info">
                    <h4>${doc.name}</h4>
                    <p>${doc.date} • ${doc.size}</p>
                </div>
            `;
            card.addEventListener('click', () => openViewer(doc));
            documentsGrid.appendChild(card);
        });
    }

    function updateStats() {
        totalDocsEl.textContent = documents.length;
        // Just a mock for "Recent" - say last 24h or just count the new ones
        recentDocsEl.textContent = documents.length;
    }

    function openModal(modal) {
        modal.classList.add('active');
    }

    function closeModal(modal) {
        modal.classList.remove('active');
        if (modal === viewerModal) {
            pdfViewer.src = ''; // Clear source to stop playing/memory
        }
    }

    function openViewer(doc) {
        viewerTitle.textContent = doc.name;
        pdfViewer.src = doc.url;
        openModal(viewerModal);
    }

    function formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});
