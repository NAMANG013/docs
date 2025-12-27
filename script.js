document.addEventListener('DOMContentLoaded', () => {
    // State
    let documents = [];

    // DOM Elements
    const documentsGrid = document.getElementById('documentsGrid');
    const uploadModal = document.getElementById('uploadModal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const viewerModal = document.getElementById('viewerModal');
    const pdfViewer = document.getElementById('pdfViewer');
    const viewerTitle = document.getElementById('viewerTitle');

    // Initialize
    loadDocuments();
    renderDocuments();

    // Event Listeners
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

    // File Upload Handling (Drag & Drop only since button is gone)
    if (dropZone) {
        dropZone.addEventListener('click', () => fileInput && fileInput.click());

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
    }

    if (fileInput) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length) {
                handleFiles(fileInput.files);
            }
        });
    }

    // Functions
    function loadDocuments() {
        if (window.initialDocuments && Array.isArray(window.initialDocuments)) {
            const preloaded = window.initialDocuments.map(doc => ({
                ...doc,
                id: 'pre-' + Date.now() + Math.random(),
                isLocal: true
            }));

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
        if (uploadModal) closeModal(uploadModal);
    }

    function renderDocuments(docsToRender = documents) {
        if (!documentsGrid) return;
        documentsGrid.innerHTML = '';

        if (docsToRender.length === 0) {
            documentsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-secondary);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                    <p>No documents found</p>
                    <p style="font-size: 0.9rem;">Add PDFs to the DOCS_PDF folder</p>
                </div>
            `;
            return;
        }

        docsToRender.forEach(doc => {
            const card = document.createElement('div');
            card.className = 'doc-card';
            // Unique ID for the container to inject thumbnail
            const thumbId = `thumb-${doc.id}`.replace(/[^a-zA-Z0-9-_]/g, '');

            card.innerHTML = `
                <div class="doc-preview" id="${thumbId}">
                    <div class="spinner"></div> <!-- Loading state -->
                </div>
                <div class="doc-info">
                    <h4>${doc.name}</h4>
                    <p>${doc.date} • ${doc.size}</p>
                </div>
            `;
            card.addEventListener('click', () => openViewer(doc));
            documentsGrid.appendChild(card);

            // Generate Thumbnail
            generateThumbnail(doc, thumbId);
        });
    }

    async function generateThumbnail(doc, containerId) {
        try {
            const container = document.getElementById(containerId);
            if (!container) return;

            const loadingTask = pdfjsLib.getDocument(doc.url);
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);

            // Desired thumbnail dimensions
            const desiredWidth = 200;
            const viewport = page.getViewport({ scale: 1 });
            const scale = desiredWidth / viewport.width;
            const scaledViewport = page.getViewport({ scale: scale });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = scaledViewport.height;
            canvas.width = scaledViewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: scaledViewport
            };

            await page.render(renderContext).promise;

            // Replace spinner with canvas
            container.innerHTML = '';
            container.appendChild(canvas);

        } catch (error) {
            console.error('Error generating thumbnail for', doc.name, error);
            // Fallback to icon
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><text x="12" y="18" text-anchor="middle" font-size="6" font-weight="bold" fill="currentColor">PDF</text></svg>
                `;
            }
        }
    }

    function openModal(modal) {
        if (modal) modal.classList.add('active');
    }

    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            if (modal === viewerModal && pdfViewer) {
                pdfViewer.src = ''; // Clear source to stop playing/memory
            }
        }
    }

    function openViewer(doc) {
        if (viewerTitle) viewerTitle.textContent = doc.name;
        if (pdfViewer) pdfViewer.src = doc.url;
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
