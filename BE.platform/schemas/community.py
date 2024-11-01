# app/schemas/community.py
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class WriterResponse(BaseModel):
    id: int
    name: str
    avatar: Optional[str] = None

    class Config:
        orm_mode = True


class CommunityCreate(BaseModel):
    title: str
    content: str
    writer_id: int

class CommunityResponse(BaseModel):
    id: int
    writer_id: int
    title: str
    content: str
    created_at: datetime
    image: Optional[str] = None
    answers: List[dict] = []

    class Config:
        orm_mode = True
        
class CommunitySearchResponse(BaseModel):
    id: int
    writer_name: str
    writer_id: int
    title: str
    content: str
    image: Optional[str] = None
    created_at: datetime
    answers: List[dict] = []

    class Config:
        orm_mode = True
        
class CommunityUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

    class Config:
        orm_mode = True

