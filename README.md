# Document Archive

This is a static web application to manage and view your PDF documents.

## Directory Structure

- `index.html`: Main application file.
- `style.css`: Stylesheet.
- `script.js`: Application logic.
- `data.js`: Auto-generated file containing the list of PDFs in `DOCS_PDF` folder.
- `DOCS_PDF/`: Place your PDF files here.
- `scan_docs.py`: Python script to scan `DOCS_PDF` and update `data.js`.

## How to add documents

1.  Put your `.pdf` files into the `DOCS_PDF` folder.
2.  Run the scanner script to update the web app's file list:
    ```bash
    python3 scan_docs.py
    ```
3.  Refresh the `index.html` page in your browser.

## Features

- **Upload**: Drag & drop or verify files manually.
- **Preload**: Automatically load files from `DOCS_PDF` folder (via the script above).
- **View**: Built-in PDF viewer.
