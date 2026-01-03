# Backend Integration Guide: AI Bridge

This guide explains how to hook up the `ai_bridge` service to your FastAPI routers.

✅ **Key Concept**: You never import `AI-services` directly. Always go through `app.services.ai_bridge`.

---

## 1. Import the Bridge

In your router file (e.g., `backend/app/routers/complaints.py`):

```python
from app.services.ai_bridge import get_similar_complaints, get_duplicate_complaint
```

---

## 2. Example Router Implementation

Here is how you would implement the similarity check endpoint:

```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.ai_bridge import get_similar_complaints

router = APIRouter(prefix="/complaints", tags=["complaints"])

# --- Request/Response Models ---
class SimilarityCheckRequest(BaseModel):
    text: str
    threshold: float = 0.75  # Optional override

class SimilarComplaintResponse(BaseModel):
    complaint_id: int
    similarity_score: float

# --- The Endpoint ---
@router.post("/check-similarity", response_model=list[SimilarComplaintResponse])
def check_similarity(
    request: SimilarityCheckRequest,
    db: Session = Depends(get_db)
):
    """
    Check for similar complaints before submission.
    """
    # 1. Fetch recent complaints from DB to compare against
    # Optimization: Limit to last 30 days or open complaints only
    existing_complaints_orm = db.query(Complaint).filter(
        Complaint.status != "closed"
    ).all()
    
    # 2. Convert ORM objects to list of dicts for AI service
    existing_list = [
        {"id": c.id, "text": c.description} 
        for c in existing_complaints_orm
    ]
    
    # 3. Call the AI Bridge
    # This runs the SBERT model (cached) and returns matches
    matches = get_similar_complaints(
        complaint_text=request.text,
        existing_complaints=existing_list,
        threshold=request.threshold
    )
    
    return matches
```

---

## 3. Duplicate Prevention (On Submit)

You can also use the bridge to **prevent duplicates** at the time of creation:

```python
@router.post("/", response_model=ComplaintResponse)
def create_complaint(complaint: ComplaintCreate, db: Session = Depends(get_db)):
    # 1. Fetch open complaints
    existing = ... # (fetch logic)
    
    # 2. Check for EXACT duplicate (high threshold)
    duplicate = get_duplicate_complaint(complaint.description, existing)
    
    if duplicate:
        # Option A: Block it
        raise HTTPException(
            status_code=400, 
            detail=f"Duplicate of complaint #{duplicate['complaint_id']}"
        )
        # Option B: Return the existing one (Idempotency)
        # return db.query(Complaint).get(duplicate['complaint_id'])
    
    # 3. If distinct, create new
    new_complaint = Complaint(**complaint.dict())
    db.add(new_complaint)
    db.commit()
    return new_complaint
```
