from pathlib import Path
import re
import fitz

pdf_dir = Path(r'C:\Users\Priyesh\Downloads\papers')

for pdf_path in sorted(pdf_dir.glob('*.pdf')):
    print('\n' + '=' * 80)
    print(pdf_path.name)
    try:
        doc = fitz.open(pdf_path)
        text = '\n'.join(page.get_text('text') for page in doc)
        m = re.search(r'abstract\s*[:\-]?(.*?)(?=(\n\s*(?:keywords?|introduction|1\.|1\s*\.)|$))', text, re.I | re.S)
        if m:
            abstract = re.sub(r'\s+', ' ', m.group(1)).strip()
            print(abstract[:1200])
        else:
            print('NO ABSTRACT BLOCK FOUND')
    except Exception as exc:
        print('ERR', exc)
