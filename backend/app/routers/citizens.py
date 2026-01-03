"""
Citizens Router for Samadhan Setu
Handles complaint submission, tracking, and community features
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..auth import get_current_user, require_citizen
from ..models import (
    User, UserRole, Complaint, ComplaintStatus, ComplaintPriority,
    ComplaintStatusLog, Department, CategoryMapping
)
from ..schemas import (
    ComplaintCreate, ComplaintResponse, ComplaintListResponse,
    ComplaintAIResponse
)
from ..ai import process_complaint, classify_complaint, calculate_priority

router = APIRouter(prefix="/api/complaints", tags=["Citizens"])


@router.post("/", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def submit_complaint(
    complaint_data: ComplaintCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a new complaint (citizens only)
    AI automatically classifies category and assigns priority
    """
    # AI Processing
    ai_result = process_complaint(complaint_data.description)
    
    # Find department for routing
    category_mapping = db.query(CategoryMapping).filter(
        CategoryMapping.category == ai_result['category']
    ).first()
    
    department_id = category_mapping.department_id if category_mapping else None
    
    # Map priority string to enum
    priority_map = {
        'Low': ComplaintPriority.LOW,
        'Medium': ComplaintPriority.MEDIUM,
        'High': ComplaintPriority.HIGH
    }
    
    # Create complaint
    new_complaint = Complaint(
        user_id=current_user.id,
        category=ai_result['category'],
        description=complaint_data.description,
        location=complaint_data.location,
        ward=complaint_data.ward,
        priority=priority_map.get(ai_result['priority'], ComplaintPriority.LOW),
        urgency_score=ai_result['urgency_score'],
        ai_confidence=ai_result['confidence'],
        status=ComplaintStatus.PENDING,
        department_id=department_id,
        is_public=complaint_data.is_public,
        upvotes=0
    )
    
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    
    # Create initial status log
    status_log = ComplaintStatusLog(
        complaint_id=new_complaint.id,
        status=ComplaintStatus.PENDING,
        remarks="Complaint submitted and auto-classified by AI",
        updated_by=current_user.id
    )
    db.add(status_log)
    db.commit()
    
    return ComplaintResponse.model_validate(new_complaint)


@router.get("/preview-ai", response_model=ComplaintAIResponse)
async def preview_ai_classification(
    description: str = Query(..., min_length=10, description="Complaint description"),
    current_user: User = Depends(get_current_user)
):
    """
    Preview AI classification before submitting
    Useful for showing real-time category detection in the form
    """
    ai_result = process_complaint(description)
    
    return ComplaintAIResponse(
        category=ai_result['category'],
        priority=ai_result['priority'],
        urgency_score=ai_result['urgency_score'],
        confidence=ai_result['confidence'],
        department_id=None  # Not looking up department for preview
    )


@router.get("/my", response_model=List[ComplaintResponse])
async def get_my_complaints(
    status_filter: Optional[ComplaintStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's complaints with status history
    """
    query = db.query(Complaint).filter(Complaint.user_id == current_user.id)
    
    if status_filter:
        query = query.filter(Complaint.status == status_filter)
    
    complaints = query.order_by(desc(Complaint.created_at)).all()
    
    return [ComplaintResponse.model_validate(c) for c in complaints]


@router.get("/public", response_model=List[ComplaintResponse])
async def get_public_complaints(
    category: Optional[str] = None,
    sort_by: str = Query("recent", enum=["recent", "upvotes", "priority"]),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get public community complaints feed
    Can be accessed without authentication
    """
    query = db.query(Complaint).filter(Complaint.is_public == True)
    
    if category:
        query = query.filter(Complaint.category == category)
    
    # Sorting
    if sort_by == "upvotes":
        query = query.order_by(desc(Complaint.upvotes))
    elif sort_by == "priority":
        # Order by priority (High > Medium > Low)
        query = query.order_by(
            desc(Complaint.priority == ComplaintPriority.HIGH),
            desc(Complaint.priority == ComplaintPriority.MEDIUM),
            desc(Complaint.created_at)
        )
    else:  # recent
        query = query.order_by(desc(Complaint.created_at))
    
    # Pagination
    offset = (page - 1) * per_page
    complaints = query.offset(offset).limit(per_page).all()
    
    return [ComplaintResponse.model_validate(c) for c in complaints]


@router.get("/{complaint_id}", response_model=ComplaintResponse)
async def get_complaint(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific complaint by ID
    Citizens can only view their own or public complaints
    """
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )
    
    # Check access: owner, public, or officer/admin
    if not (
        complaint.user_id == current_user.id or
        complaint.is_public or
        current_user.role in [UserRole.OFFICER, UserRole.ADMIN]
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return ComplaintResponse.model_validate(complaint)


@router.post("/{complaint_id}/upvote")
async def upvote_complaint(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upvote a public complaint
    """
    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id,
        Complaint.is_public == True
    ).first()
    
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found or not public"
        )
    
    # Increment upvotes
    complaint.upvotes += 1
    
    # Recalculate priority based on new upvotes
    new_priority, urgency = calculate_priority(
        complaint.description,
        complaint.category,
        complaint.upvotes
    )
    
    priority_map = {
        'Low': ComplaintPriority.LOW,
        'Medium': ComplaintPriority.MEDIUM,
        'High': ComplaintPriority.HIGH
    }
    complaint.priority = priority_map.get(new_priority, complaint.priority)
    complaint.urgency_score = urgency
    
    db.commit()
    
    return {"message": "Upvoted successfully", "upvotes": complaint.upvotes}
