from pathlib import Path
import re
import fitz

pdf_dir = Path(r'C:\Users\Priyesh\Downloads\papers')
out_dir = Path('assets/publications/pdfs')
out_dir.mkdir(parents=True, exist_ok=True)


def safe_name(name: str) -> str:
    cleaned = re.sub(r'[^A-Za-z0-9_.\- ]+', '', name)
    cleaned = cleaned.replace(' ', '_')
    cleaned = re.sub(r'_+', '_', cleaned)
    return cleaned.strip('_')

for pdf_path in sorted(pdf_dir.glob('*.pdf')):
    try:
        doc = fitz.open(pdf_path)
        page = doc.load_page(0)
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
        out_path = out_dir / f"{safe_name(pdf_path.stem)}.png"
        pix.save(out_path)
        print(f'OK {pdf_path.name} -> {out_path.name}')
    except Exception as exc:
        print(f'ERR {pdf_path.name}: {exc}')
