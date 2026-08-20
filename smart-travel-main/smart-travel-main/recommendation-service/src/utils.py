import unicodedata
import re

def normalize_text(text: str) -> str:
    """
    Remove Vietnamese accents, lowercase, and strip.
    """
    if not isinstance(text, str):
        return ""
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    return re.sub(r'[^a-z0-9\s]', '', text.lower()).strip()
