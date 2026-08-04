from pathlib import Path
import re
import fitz
import json

pdf_dir = Path(r'C:\Users\Priyesh\Downloads\papers')
stop_markers = [
    'INDEX TERMS', 'KEYWORDS', 'INTRODUCTION', 'I. INTRODUCTION', 'MATERIALS AND METHODS',
    'METHODS', 'RESULTS', 'DISCUSSION', 'CONCLUSION', 'REFERENCES', 'II.', 'III.', 'IV.', 'V.'
]


def clean_text(text: str) -> str:
    text = re.sub(r'\u00A0', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def extract_abstract(pdf_path: Path) -> str:
    doc = fitz.open(pdf_path)
    raw = '\n'.join(page.get_text('text') for page in doc)
    # Try exact abstract heading first
    for term in ['ABSTRACT', 'PURPOSE', 'OBJECTIVES', 'BACKGROUND', 'OBJECTIVE']:
        idx = raw.find(term)
        if idx != -1:
            start = idx + len(term)
            tail = raw[start:]
            for marker in stop_markers:
                m_idx = tail.find(marker)
                if m_idx != -1:
                    abstract = tail[:m_idx]
                    return clean_text(abstract)
            return clean_text(tail)

    # Fallback: just pull the first 1000 chars after the title page if nothing matched
    return clean_text(raw[:1000])


records = {}
for pdf_path in sorted(pdf_dir.glob('*.pdf')):
    abstract = extract_abstract(pdf_path)
    records[pdf_path.stem] = abstract

Path('paper_exact_abstracts.json').write_text(json.dumps(records, indent=2, ensure_ascii=False), encoding='utf-8')
print('WROTE paper_exact_abstracts.json')
