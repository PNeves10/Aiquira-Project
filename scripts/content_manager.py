from typing import List, Dict, Optional, Union
from dataclasses import dataclass
from datetime import datetime
from slugify import slugify
import markdown
import bleach
from bs4 import BeautifulSoup
import json
from .market_intelligence import MarketIntelligence

@dataclass
class ContentTag:
    id: str
    name: str
    slug: str
    category: str  # 'sector', 'region', 'topic', etc.
    usage_count: int = 0

@dataclass
class ContentAuthor:
    id: str
    name: str
    title: str
    company: Optional[str]
    bio: str
    avatar_url: Optional[str]
    expertise_areas: List[str]
    social_links: Dict[str, str]
    content_count: int = 0

@dataclass
class ContentItem:
    id: str
    title: str
    slug: str
    content: str
    summary: str
    author_id: str
    tags: List[str]
    type: str  # 'article', 'blog', 'forum_post'
    status: str  # 'draft', 'published', 'archived'
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]
    views_count: int = 0
    likes_count: int = 0
    comments_count: int = 0
    reading_time: int = 0  # in minutes

@dataclass
class Comment:
    id: str
    content_id: str
    author_id: str
    text: str
    created_at: datetime
    updated_at: Optional[datetime]
    parent_id: Optional[str]  # for nested comments
    likes_count: int = 0
    is_edited: bool = False

class ContentManager:
    def __init__(self, market_intelligence: MarketIntelligence):
        """Initialize the Content Management System."""
        self.market_intelligence = market_intelligence
        self.allowed_html_tags = [
            'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'strong', 'em', 'a', 'ul', 'ol', 'li',
            'code', 'pre', 'blockquote', 'img'
        ]
        self.allowed_attributes = {
            'a': ['href', 'title'],
            'img': ['src', 'alt', 'title']
        }

    async def create_article_from_report(self, report: Dict) -> ContentItem:
        """Automatically generate an article from a market intelligence report."""
        title = f"State of Digital M&A in Portugal: {report['period']['start']} - {report['period']['end']}"
        
        # Generate article content
        content = f"""
# {title}

{report['summary']}

## Market Overview

### Key Trends
"""
        
        for trend in report['trends']:
            content += f"\n- **{trend['sector']}**: {trend['metric']} ({trend['significance']} significance)"
        
        content += "\n\n## Sector Analysis\n"
        
        for sector, metrics in report['sector_analysis'].items():
            content += f"\n### {sector}\n"
            content += f"- Deal Count: {metrics.deal_count}\n"
            content += f"- Average Deal Value: €{metrics.average_price:,.2f}\n"
            content += f"- YoY Growth: {metrics.yoy_growth*100:.1f}%\n"
            content += f"- Market Sentiment: {metrics.sentiment_score:.2f}\n"
        
        # Create article
        article = ContentItem(
            id=f"report_{datetime.now().strftime('%Y%m%d')}",
            title=title,
            slug=slugify(title),
            content=content,
            summary=report['summary'].split('\n')[0],
            author_id="system",
            tags=["Market Report", "Digital M&A", "Portugal"] + list(report['sector_analysis'].keys()),
            type="article",
            status="published",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            published_at=datetime.now(),
            reading_time=len(content.split()) // 200  # Approximate reading time
        )
        
        return article

    def create_content(self, 
                      title: str,
                      content: str,
                      author_id: str,
                      content_type: str,
                      tags: List[str],
                      summary: Optional[str] = None) -> ContentItem:
        """Create a new content item."""
        # Sanitize HTML content
        clean_content = bleach.clean(
            markdown.markdown(content),
            tags=self.allowed_html_tags,
            attributes=self.allowed_attributes
        )
        
        # Generate summary if not provided
        if not summary:
            soup = BeautifulSoup(clean_content, 'html.parser')
            summary = ' '.join(soup.get_text().split()[:50]) + '...'
        
        item = ContentItem(
            id=f"{content_type}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            title=title,
            slug=slugify(title),
            content=clean_content,
            summary=summary,
            author_id=author_id,
            tags=tags,
            type=content_type,
            status="draft",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            published_at=None,
            reading_time=len(content.split()) // 200
        )
        
        return item

    def add_comment(self,
                   content_id: str,
                   author_id: str,
                   text: str,
                   parent_id: Optional[str] = None) -> Comment:
        """Add a comment to a content item."""
        comment = Comment(
            id=f"comment_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            content_id=content_id,
            author_id=author_id,
            text=bleach.clean(text, tags=[], strip=True),
            created_at=datetime.now(),
            parent_id=parent_id
        )
        
        return comment

    def create_tag(self, name: str, category: str) -> ContentTag:
        """Create a new content tag."""
        tag = ContentTag(
            id=f"tag_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            name=name,
            slug=slugify(name),
            category=category
        )
        
        return tag

    def create_author(self,
                     name: str,
                     title: str,
                     bio: str,
                     expertise_areas: List[str],
                     company: Optional[str] = None,
                     avatar_url: Optional[str] = None,
                     social_links: Optional[Dict[str, str]] = None) -> ContentAuthor:
        """Create a new content author."""
        author = ContentAuthor(
            id=f"author_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            name=name,
            title=title,
            company=company,
            bio=bio,
            avatar_url=avatar_url,
            expertise_areas=expertise_areas,
            social_links=social_links or {}
        )
        
        return author

    def generate_related_content(self, content_item: ContentItem) -> List[ContentItem]:
        """Generate related content suggestions."""
        # This is a placeholder. In production, implement content similarity matching
        return []

    def generate_seo_metadata(self, content_item: ContentItem) -> Dict[str, str]:
        """Generate SEO metadata for content."""
        return {
            "title": content_item.title,
            "description": content_item.summary,
            "keywords": ", ".join(content_item.tags),
            "author": content_item.author_id,
            "published_time": content_item.published_at.isoformat() if content_item.published_at else None,
            "modified_time": content_item.updated_at.isoformat()
        }

    def format_content_for_social(self, content_item: ContentItem) -> Dict[str, str]:
        """Format content for social media sharing."""
        return {
            "title": content_item.title,
            "description": content_item.summary,
            "hashtags": " ".join(f"#{tag.replace(' ', '')}" for tag in content_item.tags),
            "linkedin_text": f"{content_item.title}\n\n{content_item.summary}\n\nRead more: [Link]",
            "twitter_text": f"{content_item.title[:100]}... #DigitalMA #Portugal"
        }

    def analyze_content_performance(self, content_item: ContentItem) -> Dict:
        """Analyze content performance metrics."""
        engagement_rate = (
            content_item.likes_count + 
            content_item.comments_count * 2
        ) / max(content_item.views_count, 1)
        
        return {
            "views": content_item.views_count,
            "likes": content_item.likes_count,
            "comments": content_item.comments_count,
            "engagement_rate": engagement_rate,
            "reading_time": content_item.reading_time,
            "age_days": (datetime.now() - content_item.created_at).days
        }

    def get_trending_topics(self) -> List[Dict]:
        """Get trending topics based on content engagement."""
        # This is a placeholder. In production, implement trending topic analysis
        return [
            {
                "tag": "Digital M&A",
                "mentions": 150,
                "growth": 0.25
            },
            {
                "tag": "E-commerce",
                "mentions": 120,
                "growth": 0.15
            }
        ] 