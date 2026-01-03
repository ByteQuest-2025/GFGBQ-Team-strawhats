"""
Priority Scoring Module for Samadhan Setu
Calculates urgency and priority for complaints
Formula: Priority = Urgency + Severity + Community Factor
"""
from typing import Tuple, Dict, List
from .text_processor import TextProcessor

class PriorityCalculator:
    """
    Calculates priority scores for complaints based on:
    - Urgency keywords (danger, emergency, etc.)
    - Category severity (health issues are more critical)
    - Community support (upvotes)
    """
    
    # Urgency keywords with their weight scores
    URGENCY_KEYWORDS: Dict[str, int] = {
        # Critical - immediate risk to life
        'death': 5, 'dying': 5, 'dead': 5, 'fatal': 5,
        'fire': 5, 'burning': 5, 'explosion': 5, 'blast': 5,
        'electrocution': 5, 'shock': 4,
        
        # High urgency - significant risk
        'danger': 4, 'dangerous': 4, 'hazard': 4, 'hazardous': 4,
        'urgent': 4, 'emergency': 4, 'critical': 4,
        'accident': 4, 'injury': 4, 'injured': 4,
        'collapse': 4, 'collapsed': 4, 'falling': 4,
        'spark': 4, 'sparking': 4,
        
        # Medium urgency - needs attention soon
        'broken': 3, 'burst': 3, 'flooding': 3, 'flooded': 3,
        'blocked': 3, 'blockage': 3, 'overflow': 3,
        'stuck': 3, 'trapped': 3,
        'unsafe': 3, 'risk': 3,
        'severe': 3, 'major': 3,
        
        # Lower urgency - inconvenience
        'problem': 2, 'issue': 2, 'complaint': 2,
        'not working': 2, 'stopped': 2, 'damaged': 2,
        'leaking': 2, 'leak': 2,
    }
    
    # Category severity multipliers
    CATEGORY_SEVERITY: Dict[str, float] = {
        'Health & Safety': 1.5,
        'Electricity': 1.3,
        'Water Supply': 1.2,
        'Roads & Transport': 1.1,
        'Sanitation & Waste': 1.0,
        'General': 0.8,
    }
    
    # Priority thresholds
    HIGH_THRESHOLD = 6
    MEDIUM_THRESHOLD = 3
    
    def __init__(self):
        self.text_processor = TextProcessor()
    
    def calculate_urgency_score(self, text: str) -> int:
        """
        Calculate urgency score based on keyword presence
        Returns score from 0-10
        """
        if not text:
            return 0
        
        cleaned = self.text_processor.clean_text(text)
        total_score = 0
        
        for keyword, weight in self.URGENCY_KEYWORDS.items():
            if keyword in cleaned:
                total_score += weight
        
        # Cap at 10
        return min(10, total_score)
    
    def calculate_priority(
        self, 
        text: str, 
        category: str, 
        upvotes: int = 0
    ) -> Tuple[str, int]:
        """
        Calculate overall priority for a complaint
        
        Args:
            text: Complaint description
            category: Detected/assigned category
            upvotes: Number of community upvotes
            
        Returns:
            Tuple of (priority_level: "Low"|"Medium"|"High", urgency_score: int)
        """
        # Base urgency from keywords
        urgency_score = self.calculate_urgency_score(text)
        
        # Apply category severity multiplier
        severity_multiplier = self.CATEGORY_SEVERITY.get(category, 1.0)
        adjusted_score = urgency_score * severity_multiplier
        
        # Community factor (upvotes boost priority)
        if upvotes >= 50:
            adjusted_score += 3
        elif upvotes >= 20:
            adjusted_score += 2
        elif upvotes >= 10:
            adjusted_score += 1
        
        # Determine priority level
        if adjusted_score >= self.HIGH_THRESHOLD:
            priority = "High"
        elif adjusted_score >= self.MEDIUM_THRESHOLD:
            priority = "Medium"
        else:
            priority = "Low"
        
        return (priority, int(adjusted_score))
    
    def get_urgency_keywords_found(self, text: str) -> List[str]:
        """Get list of urgency keywords found in text"""
        cleaned = self.text_processor.clean_text(text)
        found = []
        
        for keyword in self.URGENCY_KEYWORDS.keys():
            if keyword in cleaned:
                found.append(keyword)
        
        return found
    
    def calculate_with_details(
        self, 
        text: str, 
        category: str, 
        upvotes: int = 0
    ) -> Dict:
        """
        Calculate priority with detailed breakdown
        Useful for debugging and transparency
        """
        urgency_score = self.calculate_urgency_score(text)
        severity_multiplier = self.CATEGORY_SEVERITY.get(category, 1.0)
        priority, final_score = self.calculate_priority(text, category, upvotes)
        
        return {
            'priority': priority,
            'urgency_score': urgency_score,
            'severity_multiplier': severity_multiplier,
            'upvote_bonus': 3 if upvotes >= 50 else 2 if upvotes >= 20 else 1 if upvotes >= 10 else 0,
            'final_score': final_score,
            'keywords_found': self.get_urgency_keywords_found(text)
        }


# Singleton instance
priority_calculator = PriorityCalculator()

def calculate_priority(text: str, category: str, upvotes: int = 0) -> Tuple[str, int]:
    """Convenience function to calculate priority"""
    return priority_calculator.calculate_priority(text, category, upvotes)

def get_urgency_score(text: str) -> int:
    """Convenience function to get urgency score only"""
    return priority_calculator.calculate_urgency_score(text)
