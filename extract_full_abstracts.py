from pathlib import Path
import re
import fitz

pdf_dir = Path(r'C:\Users\Priyesh\Downloads\papers')
out_path = Path('paper_abstracts.txt')

sections = []
for pdf_path in sorted(pdf_dir.glob('*.pdf')):
    text = ''
    try:
        doc = fitz.open(pdf_path)
        text = '\n'.join(page.get_text('text') for page in doc)
    except Exception as exc:
        sections.append(f'[{pdf_path.name}] ERROR: {exc}')
        continue

    clean = re.sub(r'\s+', ' ', text)
    match = re.search(r'(?is)(abstract|objectives|purpose|background)[^\n]{0,120}(.{200,2000}?)\s*(?=(methods|results|conclusion|discussion|introduction|\b1\.|\b2\.|\b3\.|\b4\.|\b5\.|\b6\.|\b7\.|\b8\.|\b9\.|\b10\.|\b11\.|\b12\.) )', clean)
    if not match:
        match = re.search(r'(?is)(abstract|objectives|purpose|background)[^\n]{0,120}(.{200,2000}?)\s*(?=\b(methods|results|conclusion|discussion|introduction)\b)', clean)
    if not match:
        match = re.search(r'(?is)(abstract|objectives|purpose|background)[^\n]{0,120}(.{200,2000}?)$', clean)
    if match:
        abstract = re.sub(r'\s+', ' ', match.group(2)).strip()
        sections.append(f'[{pdf_path.name}]\n{abstract}\n')
    else:
        sections.append(f'[{pdf_path.name}]\nNO_MATCH\n')

out_path.write_text('\n'.join(sections), encoding='utf-8')
print(f'WROTE {out_path}')
