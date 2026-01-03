from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..models.complaint import ComplaintStatus, ComplaintPriority

class ComplaintBase(BaseModel):
    description: str
    location: str
    ward: Optional[str] = None
    is_public: Optional[bool] = True

class ComplaintCreate(ComplaintBase):
    """Schema for creating a new complaint - category, priority are AI-assigned"""
    pass

class ComplaintUpdate(BaseModel):
    """Schema for updating complaint (admin/officer)"""
    status: Optional[ComplaintStatus] = None
    remarks: Optional[str] = None
    assigned_officer_id: Optional[int] = None

class ComplaintAIResponse(BaseModel):
    """AI classification response"""
    category: str
    priority: ComplaintPriority
    urgency_score: int
    confidence: int
    department_id: Optional[int] = None

class StatusLogResponse(BaseModel):
    id: int
    status: ComplaintStatus
    remarks: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class ComplaintResponse(ComplaintBase):
    id: int
    user_id: int
    category: str
    priority: ComplaintPriority
    urgency_score: int
    status: ComplaintStatus
    department_id: Optional[int]
    upvotes: int
    attachments: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    status_logs: Optional[List[StatusLogResponse]] = []
    
    class Config:
        from_attributes = True

class ComplaintListResponse(BaseModel):
    complaints: List[ComplaintResponse]
    total: int
    page: int
    per_page: int

class ComplaintStats(BaseModel):
    """Statistics for dashboard"""
    total: int
    pending: int
    in_progress: int
    resolved: int
    rejected: int
    by_category: dict
    by_priority: dict
