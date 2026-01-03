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
