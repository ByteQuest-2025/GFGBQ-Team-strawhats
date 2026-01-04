from typing import List, Dict, Optional
from collections import namedtuple
# from ...ai_services.insights.service import get_insights # Broken import
from .complaint_clustering import cluster_complaints_by_text
from ..ai import classify_complaint as ai_classify
from ..ai.priority import get_urgency_score

# Simple wrapper to mimic Complaint object interface expected by clustering service
ComplaintWrapper = namedtuple("ComplaintWrapper", ["id", "description", "category", "ward"])

class AIBridge:
    """
    Bridge service to connect the main Backend with internal AI services.
    This allows for an architectural separation between DB logic and ML processing.
    """
    
    @staticmethod
    def get_complaint_patterns(complaints_data: List[dict]) -> List[dict]:
        """
        Calls the internal Insights Service to find recurring patterns.
        
        Input should be a list of dicts with:
        - id: int
        - text: str
        - ward: str
        - category: str
        """
        if not complaints_data:
            return []
            
        # Wrap dicts into objects for the clustering service
        wrapped_complaints = [
            ComplaintWrapper(
                id=c.get("id"),
                description=c.get("text", ""),
                category=c.get("category", ""),
                ward=c.get("ward", "")
            )
            for c in complaints_data
        ]
        
        # Call the local clustering logic
        clusters = cluster_complaints_by_text(wrapped_complaints)
        
        # Transform for frontend consumption
        # The admin UI expects specific format? 
        # The frontend Guide says:
        # [ { "insight_name": ..., "category": ..., "support_count": ..., "locations": ... } ]
        
        insights = []
        for cluster in clusters:
            if cluster["count"] < 2:
                continue
                
            insights.append({
                "insight_name": f"Recurring {cluster['category']} Issue",
                "category": cluster["category"],
                "support_count": cluster["count"],
                "locations": [cluster["ward"]] if cluster["ward"] else [],
                "complaint_ids": cluster["member_ids"],
                "top_keywords": [] # Clustering service doesn't return keywords yet, can add later
            })
            
        return insights

    @staticmethod
    def get_similar_complaints(text: str) -> List[dict]:
        """
        Placeholder for Similarity Detection (Feature 1)
        """
        # In a real implementation, this would call a Vector DB or similarity service
        return []

    @staticmethod
    def classify_complaint(text: str) -> Dict[str, str]:
        """
        Classifies the complaint text into a category.
        """
        category, confidence = ai_classify(text)
        return {
            "category": category,
            "confidence": confidence
        }

    @staticmethod
    def get_urgency_severity(text: str) -> Dict[str, str]:
        """
        Determines urgency and severity levels from text.
        Returns:Dict with 'urgency' and 'severity' keys (Low/Medium/High).
        """
        # Use existing urgency logic to determine a level
        score = get_urgency_score(text)
        
        # Simple mapping for now based on score
        if score >= 7:
            urgency = "High"
        elif score >= 4:
            urgency = "Medium"
        else:
            urgency = "Low"
            
        # For severity, we might need category context, but for "pure text" check
        # we can default or derive. For now, we'll map severity same as urgency 
        # unless we add specific severity logic.
        severity = urgency 
        
        return {
            "urgency": urgency,
            "severity": severity
        }

# Singleton
ai_bridge = AIBridge()
