from typing import List, Dict
from ...ai_services.insights.service import get_insights

class AIBridge:
    """
    Bridge service to connect the main Backend with internal AI services.
    This allows for an architectural separation between DB logic and ML processing.
    """
    
    @staticmethod
    def get_complaint_patterns(complaints: List[dict]) -> List[dict]:
        """
        Calls the internal Insights Service to find recurring patterns.
        
        Input should be a list of dicts with:
        - id: int
        - text: str
        - ward: str
        - category: str
        """
        if not complaints:
            return []
            
        # Call the insight service from AI-services
        return get_insights(complaints)

# Singleton
ai_bridge = AIBridge()
