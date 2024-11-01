# app/models/market.py
from sqlalchemy import Column, Integer, String, Text, JSON
from sqlalchemy.orm import relationship
from database import Base

class Market(Base):
    __tablename__ = "market"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text)
    crop = Column(String, nullable=True)
    price = Column(Integer)
    location = Column(String, nullable=True)
    farm_name = Column(String, nullable=True)
    cultivation_period = Column(String, nullable=True)
    hashtags = Column(JSON, nullable=True)
    image = Column(String, nullable=True)
    writer_id = Column(Integer)
