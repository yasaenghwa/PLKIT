from pydantic import BaseModel
from typing import List, Optional

class MarketBase(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    crop: Optional[str] = None
    price: Optional[int] = None
    location: Optional[str] = None
    farm_name: Optional[str] = None
    cultivation_period: Optional[str] = None
    hashtags: Optional[List[str]] = None
    image: Optional[str] = None

class MarketCreate(MarketBase):
    title: str
    content: str
    crop: str
    price: int
    location: str
    farm_name: str
    cultivation_period: str
    writer_id: int

class MarketUpdate(MarketBase):
    pass

class MarketResponse(MarketBase):
    id: int
    
    class Config:
        orm_mode = True
