from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from models.market import Market
from schemas.market import MarketCreate, MarketUpdate
from typing import Optional

def create_market(db: Session, market_data: MarketCreate):
    market = Market(
        title=market_data.title,
        content=market_data.content,
        crop=market_data.crop,
        price=market_data.price,
        location=market_data.location,
        farm_name=market_data.farm_name,
        cultivation_period=market_data.cultivation_period,
        hashtags=market_data.hashtags,
        writer_id=market_data.writer_id
    )
    db.add(market)
    db.commit()
    db.refresh(market)
    return market

def update_market(db: Session, market_id: int, market_update: MarketUpdate, current_id: int):
    market = db.query(Market).filter(Market.id == market_id).first()
    if not market:
        return None
    if market.writer_id != current_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="권한이 없습니다.")
    for key, value in market_update.dict(exclude_unset=True).items():
        setattr(market, key, value)
    db.commit()
    db.refresh(market)
    return market

def get_market(db: Session, market_id: int):
    return db.query(Market).filter(Market.id == market_id).first()

def delete_market(db: Session, market_id: int):
    market = db.query(Market).filter(Market.id == market_id).first()
    if market:
        db.delete(market)
        db.commit()
    return market

def list_markets(db: Session, keyword: Optional[str] = None):
    query = db.query(Market)
    if keyword:
        query = query.filter(Market.title.contains(keyword) | Market.content.contains(keyword))
    return query.all()
