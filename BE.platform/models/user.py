# app/models/user.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    avatar = Column(String, nullable=True)
    password = Column(String, nullable=False)

    # 역방향 관계 설정
    communities = relationship("Community", back_populates="writer")
    links = relationship("UserLink", back_populates="user")

class UserLink(Base):
    __tablename__ = "user_link"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    url = Column(String, nullable=False)

    # Relationships
    user = relationship("User", back_populates="links")
