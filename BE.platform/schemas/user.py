# app/schemas/user.py
from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    name: Optional[str]
    avatar: Optional[str]

class UserCreate(UserBase):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    email: EmailStr

    class Config:
        orm_mode = True

class UserUpdate(UserBase):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str
    
class UserLinkCreate(BaseModel):
    url: str

class UserLinkResponse(UserLinkCreate):
    id: int

    class Config:
        orm_mode = True