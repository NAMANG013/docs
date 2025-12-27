import os
import json
import datetime

# Configuration
PDF_DIR = 'DOCS_PDF'
OUTPUT_FILE = 'data.js'

def get_file_info(filepath):
    stat = os.stat(filepath)
    size_bytes = stat.st_size
    timestamp = stat.st_mtime
    date_str = datetime.datetime.fromtimestamp(timestamp).strftime('%m/%d/%Y')
    
    # Format size
    for unit in ['Bytes', 'KB', 'MB', 'GB']:
        if size_bytes < 1024:
            size_str = f"{size_bytes:.2f} {unit}"
            break
        size_bytes /= 1024
    else:
        size_str = f"{size_bytes:.2f} TB"

    return {
        'name': os.path.basename(filepath),
        'size': size_str,
        'date': date_str,
        'url': f"{PDF_DIR}/{os.path.basename(filepath)}"
    }

def scan_directory():
    documents = []
    
    if not os.path.exists(PDF_DIR):
        print(f"Directory {PDF_DIR} not found. Creating it...")
        os.makedirs(PDF_DIR)
        
    for filename in os.listdir(PDF_DIR):
        if filename.lower().endswith('.pdf'):
            filepath = os.path.join(PDF_DIR, filename)
            documents.append(get_file_info(filepath))
            
    # Sort by date (newest first) as a default
    # documents.sort(key=lambda x: x['date'], reverse=True) 
    # Date string sort isn't great, but good enough for now. 

    # Write to data.js
    js_content = f"window.initialDocuments = {json.dumps(documents, indent=4)};"
    
    with open(OUTPUT_FILE, 'w') as f:
        f.write(js_content)
    
    print(f"Successfully scanned {len(documents)} documents into {OUTPUT_FILE}")

if __name__ == "__main__":
    scan_directory()
