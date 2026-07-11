from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=True)
    content_type = Column(String(20), nullable=False)
    original_content = Column(Text, nullable=False)
    url_analyzed = Column(String(500), nullable=True)
    
    seo_score = Column(Float, nullable=True)
    readability_score = Column(Float, nullable=True)
    
    recommendations = Column(JSON, nullable=True)
    keywords_data = Column(JSON, nullable=True)
    metadata_suggestions = Column(JSON, nullable=True)
    
    ai_analysis = Column(Text, nullable=True)
    
    is_bookmarked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="analyses")
