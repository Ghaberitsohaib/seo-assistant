from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime

class TextAnalysisRequest(BaseModel):
    content: str = Field(..., min_length=50, max_length=50000)
    title: Optional[str] = None

class UrlAnalysisRequest(BaseModel):
    url: HttpUrl

class KeywordData(BaseModel):
    keyword: str
    count: int
    density: float
    is_stuffed: bool = False
    position: List[int] = []

class DomainKeywordItem(BaseModel):
    keyword: str
    volume: str
    competition: str
    relevance: int

class MetadataSuggestions(BaseModel):
    title: str
    meta_description: str
    focus_keyword: str
    domain_identified: Optional[str] = None
    recommended_keywords: Optional[List[DomainKeywordItem]] = None

class Recommendation(BaseModel):
    type: str
    priority: str
    title: str
    description: str
    suggestion: Optional[str] = None

class ContentStructure(BaseModel):
    h1_count: int
    h2_count: int
    h3_count: int
    paragraph_count: int
    word_count: int
    sentence_count: int
    average_words_per_sentence: float
    average_sentences_per_paragraph: float

class AnalysisResponse(BaseModel):
    id: int
    seo_score: float
    readability_score: float
    content_structure: ContentStructure
    keywords: List[KeywordData]
    recommendations: List[Recommendation]
    metadata_suggestions: MetadataSuggestions
    ai_analysis: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class AnalysisHistoryItem(BaseModel):
    id: int
    title: Optional[str]
    content_type: str
    seo_score: Optional[float]
    readability_score: Optional[float]
    created_at: datetime
    is_bookmarked: bool
    
    class Config:
        from_attributes = True

class AnalysisHistoryResponse(BaseModel):
    total: int
    page: int
    page_size: int
    analyses: List[AnalysisHistoryItem]

class BookmarkUpdate(BaseModel):
    is_bookmarked: bool
