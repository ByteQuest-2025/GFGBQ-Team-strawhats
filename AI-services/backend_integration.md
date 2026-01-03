# Backend Integration Guide: AI Services

This guide explains how to hook up **both** AI services to your FastAPI routers.

✅ **Key Concept**: You never import `AI-services` directly. Always go through `app.services.ai_bridge`.

---

## 1. Import the Bridge

In your router file (e.g., `backend/app/routers/complaints.py`):

```python
from app.services.ai_bridge import (
    get_similar_complaints, 
    get_duplicate_complaint,
    classify_complaint
)
```

---

## 2. Feature 1: Similarity Detection (Check for Duplicates)

Use this when the user is typing or submitting a complaint to stop duplicates.

```python
@router.post("/check-similarity")
def check_similarity(text: str, db: Session = Depends(get_db)):
    # 1. Fetch complaints for context
    existing = [
        {"id": c.id, "text": c.description} 
        for c in db.query(Complaint).limit(100).all()
    ]
    
    # 2. Call Bridge
    return get_similar_complaints(text, existing)
```

---

## 3. Feature 2: Auto-Classification

Use this to auto-fill the "Category" field.

### Usage in Router

```python
class ClassificationRequest(BaseModel):
    text: str

@router.post("/classify")
def classify_complaint_endpoint(request: ClassificationRequest):
    """
    Predicts the category of a complaint.
    Returns: { "category": "Water", "confidence": 0.98, "source": "ML" }
    """
    # 1. Call Bridge (Handles ML -> Rule Fallback internally)
    result = classify_complaint(request.text)
    
    return result
```

### How the Bridge Works (Internally)
You don't need to write this logic, it's already in `ai_bridge.py`:
1.  It calls the **ML Model** (DistilBERT).
2.  If confidence < 0.60, it falls back to the **Rule-Based Classifier**.
3.  It returns the final safe category.

---

## 4. Full Complaint Creation Workflow

Here is how you might combine them in the `POST /complaints` endpoint:

```python
@router.post("/")
def create_complaint(complaint: ComplaintCreate, db: Session = Depends(get_db)):
    
    # Step A: Check for Exact Duplicate (Safety Net)
    existing_list = ... # fetch recent
    duplicate = get_duplicate_complaint(complaint.description, existing_list)
    if duplicate:
         raise HTTPException(400, "Duplicate complaint detected")

    # Step B: Auto-classify if category is missing/general
    if not complaint.category or complaint.category == "General":
        # Trust the AI Service
        ai_result = classify_complaint(complaint.description)
        complaint.category = ai_result["category"]

    # Step C: Save
    new_complaint = Complaint(**complaint.dict())
    db.add(new_complaint)
    db.commit()
    
    return new_complaint
```
