import re
from typing import List, Dict
from collections import Counter

try:
    import spacy  # type: ignore # pyrefly: ignore [missing-import]
    try:
        nlp_obj = spacy.load("fr_core_news_lg")
    except OSError:
        try:
            nlp_obj = spacy.load("fr_core_news_md")
        except OSError:
            try:
                nlp_obj = spacy.load("fr_core_news_sm")
            except OSError:
                try:
                    nlp_obj = spacy.load("en_core_news_lg")
                except OSError:
                    nlp_obj = spacy.load("en_core_web_sm")
    
    STOP_WORDS = set(nlp_obj.Defaults.stop_words)
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False
    nlp_obj = None
    STOP_WORDS = set(["le", "la", "les", "de", "des", "du", "et", "en", "un", "une", "pour", "dans", "sur", "ce", "cette", "ces", "qui", "que", "quoi", "dont", "où"])

class MockDoc:
    def __init__(self, text):
        self.text = text
        self.words = text.split()
        self.sents = [MockSent(s) for s in re.split(r'[.!?]+', text) if s.strip()]
    def __iter__(self):
        for w in self.words:
            yield MockToken(w)
    def __len__(self):
        return len(self.words)

class MockSent:
    def __init__(self, text):
        self.text = text

class MockToken:
    def __init__(self, text):
        self.text = text
        self.lemma_ = text.lower()
        self.pos_ = "NOUN"  # Mocking as NOUN
        self.is_punct = bool(re.match(r'^[^\w\s]+$', text)) or text in ["-", "–", "—"]
        self.is_space = text.isspace()

def nlp(text):
    if SPACY_AVAILABLE and nlp_obj is not None:
        return nlp_obj(text)
    return MockDoc(text)

KEYWORD_STUFFING_THRESHOLD = 0.03

def extract_keywords(text: str, top_n: int = 10) -> List[Dict]:
    doc = nlp(text.lower())
    
    keywords = []
    for token in doc:
        if (token.pos_ in ["NOUN", "PROPN", "VERB", "ADJ"] and 
            len(token.text) > 2 and 
            token.text not in STOP_WORDS and
            not token.is_punct and
            not token.is_space):
            keywords.append(token.lemma_)
    
    word_freq = Counter(keywords)
    total_words = len(doc)
    
    result = []
    for word, count in word_freq.most_common(top_n):
        density = (count / total_words) if total_words > 0 else 0
        result.append({
            "keyword": word,
            "count": count,
            "density": round(density * 100, 2),
            "is_stuffed": density > KEYWORD_STUFFING_THRESHOLD,
            "position": find_keyword_positions(text.lower(), word)
        })
    
    return result

def find_keyword_positions(text: str, keyword: str) -> List[int]:
    positions = []
    words = text.split()
    for i, word in enumerate(words):
        if keyword in word:
            positions.append(i + 1)
    return positions[:5]

def analyze_structure(text: str) -> Dict:
    sentences = [s.text for s in nlp(text).sents]
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    
    h1_count = len(re.findall(r'^#\s+.+$', text, re.MULTILINE))
    h2_count = len(re.findall(r'^##\s+.+$', text, re.MULTILINE))
    h3_count = len(re.findall(r'^###\s+.+$', text, re.MULTILINE))
    
    total_sentences = len(sentences)
    total_words = len(text.split())
    total_paragraphs = len(paragraphs)
    
    avg_words_per_sentence = total_words / total_sentences if total_sentences > 0 else 0
    avg_sentences_per_paragraph = total_sentences / total_paragraphs if total_paragraphs > 0 else 0
    
    return {
        "h1_count": h1_count,
        "h2_count": h2_count,
        "h3_count": h3_count,
        "paragraph_count": len(paragraphs),
        "word_count": total_words,
        "sentence_count": total_sentences,
        "average_words_per_sentence": round(avg_words_per_sentence, 1),
        "average_sentences_per_paragraph": round(avg_sentences_per_paragraph, 1)
    }

def calculate_readability_score(text: str) -> float:
    doc = nlp(text)
    
    sentences = list(doc.sents)
    total_sentences = len(sentences)
    if total_sentences == 0:
        return 0
    
    words = [token for token in doc if not token.is_punct and not token.is_space]
    total_words = len(words)
    total_syllables = sum(count_syllables(token.text) for token in words)
    
    if total_words == 0:
        return 0
    
    avg_sentence_length = total_words / total_sentences
    avg_syllables_per_word = total_syllables / total_words
    
    # Using the French Flesch formula (Flesch adapted for French)
    readability = 207 - (1.015 * avg_sentence_length) - (73.6 * avg_syllables_per_word)
    readability = max(0, min(100, readability))
    
    return round(readability, 1)

def count_syllables(word: str) -> int:
    word = word.lower()
    vowels = "aeiouàâäéèêëïîôùûüÿœæ"
    count = 0
    prev_is_vowel = False
    
    for char in word:
        is_vowel = char in vowels
        if is_vowel and not prev_is_vowel:
            count += 1
        prev_is_vowel = is_vowel
    
    return max(1, count)
