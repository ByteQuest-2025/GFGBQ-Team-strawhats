"""
AI Bridge - Backend Adapter Layer

Thin adapter between the backend services and AI services.
This module provides a clean separation of concerns and ensures:
    1. No ML logic leaks into the backend
    2. No merge conflicts with other team members
    3. Future microservice migration is possible

Usage:
    from app.services.ai_bridge import get_similar_complaints
    
    similar = get_similar_complaints(
        "Water leak at street corner",
        existing_complaints
    )
"""

import sys
from pathlib import Path
from typing import Optional

# Add AI-services to Python path for imports
# This handles the case where AI-services is at project root level
_project_root = Path(__file__).parent.parent.parent.parent
_ai_services_path = _project_root / "AI-services"
if str(_ai_services_path) not in sys.path:
    sys.path.insert(0, str(_ai_services_path))

# Import from AI services
from similarity.service import find_similar_complaints, check_duplicate


def get_similar_complaints(
    complaint_text: str,
    existing_complaints: list[dict],
    threshold: float = 0.75
) -> list[dict]:
    """
    Find complaints similar to the given complaint.
    
    This is the primary API for the backend to find similar complaints
    using semantic similarity.
    
    Args:
        complaint_text: The new complaint text to check
        existing_complaints: List of existing complaints with 'id' and 'text' fields
        threshold: Similarity threshold (0-1), default 0.75
        
    Returns:
        List of similar complaints sorted by similarity score.
        Each item has 'complaint_id' and 'similarity_score'.
        
    Example:
        >>> similar = get_similar_complaints(
        ...     "Water leaking from main pipe",
        ...     [{"id": 1, "text": "Pipe burst at school"}]
        ... )
        >>> for s in similar:
        ...     print(f"Complaint #{s['complaint_id']}: {s['similarity_score']:.0%}")
    """
    return find_similar_complaints(
        complaint_text,
        existing_complaints,
        similarity_threshold=threshold
    )


def get_duplicate_complaint(
    complaint_text: str,
    existing_complaints: list[dict],
    threshold: float = 0.90
) -> Optional[dict]:
    """
    Check if a complaint is a potential duplicate.
    
    Uses a higher threshold (default 0.90) to identify near-duplicates.
    
    Args:
        complaint_text: The new complaint text to check
        existing_complaints: List of existing complaints with 'id' and 'text' fields
        threshold: Duplicate detection threshold (0-1), default 0.90
        
    Returns:
        The most similar complaint if above threshold, None otherwise.
        
    Example:
        >>> dup = get_duplicate_complaint("Water leak at road", existing)
        >>> if dup:
        ...     print(f"Possible duplicate of #{dup['complaint_id']}")
    """
    return check_duplicate(
        complaint_text,
        existing_complaints,
        duplicate_threshold=threshold
    )


# --- Category Classification Bridge ---

# Lazy import internal rule-based classifier to avoid circular deps
# We only import it when we need to fallback
# from app.ai.classifier import classify_complaint as rule_based_classify

from classification.service import classify_complaint_ml
from classification.config import CONFIDENCE_THRESHOLD, USE_ML_CLASSIFIER


def classify_complaint(text: str) -> dict:
    """
    Classify a complaint into a category using Hybrid AI.
    
    Strategy:
    1. Try ML Model (DistilBERT)
    2. If Confidence < Threshold, Fallback to Rule-Based
    
    This ensures we get the intelligence of ML but the reliability 
    of rule-based systems for ambiguous cases.
    
    Args:
        text: The complaint description
        
    Returns:
        Dict with:
        - category: The final category string
        - confidence: confidence score (0-1)
        - source: "ML" or "Rule-Based"
        
    Example:
        >>> result = classify_complaint("Sparking wire")
        >>> print(result)
        {'category': 'Electricity', 'confidence': 0.98, 'source': 'ML'}
    """
    # Import rule-based classifier here to avoid overhead and circular deps
    from app.ai.classifier import classify_complaint as rule_based_classify
    
    final_category = "General"
    final_confidence = 0.0
    source = "Rule-Based"
    
    # 1. Attempt ML Classification
    if USE_ML_CLASSIFIER:
        try:
            ml_result = classify_complaint_ml(text)
            ml_cat = ml_result["category"]
            ml_conf = ml_result["confidence"]
            
            # 2. Check Threshold
            if ml_conf >= CONFIDENCE_THRESHOLD:
                return {
                    "category": ml_cat,
                    "confidence": ml_conf,
                    "source": "ML"
                }
            else:
                # Log that we are falling back (in production use real logger)
                print(f"ML Low Confidence ({ml_conf:.2f} < {CONFIDENCE_THRESHOLD}). Falling back.")
                
        except Exception as e:
            # Graceful failure - log error and proceed to fallback
            print(f"ML Service Error: {e}. Falling back to rules.")
            
    # 3. Fallback to Rule-Based
    # Note: Rule-based returns (category, confidence_0_to_100)
    rb_cat, rb_conf_int = rule_based_classify(text)
    
    return {
        "category": rb_cat,
        "confidence": float(rb_conf_int) / 100.0,
        "source": "Rule-Based"
    }
