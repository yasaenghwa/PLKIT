# app/crud/community.py
from sqlalchemy.orm import Session
from models.user import User
from models.community import Community
from schemas.community import CommunityCreate
from typing import Optional

def create_community(db: Session, community_data: CommunityCreate):
    # writer_id로 사용자 객체를 조회하여 관계 설정
    writer = db.query(User).filter(User.id == community_data.writer_id).first()
    if not writer:
        raise ValueError("Invalid writer_id: User not found")

    # Community 객체 생성 및 writer 관계 설정
    community = Community(
        title=community_data.title,
        content=community_data.content,
        writer=writer  # writer 객체를 직접 설정
    )
    db.add(community)
    db.commit()
    db.refresh(community)
    return community

def get_community(db: Session, community_id: int):
    return db.query(Community).filter(Community.id == community_id).first()

def delete_community(db: Session, community_id: int):
    community = db.query(Community).filter(Community.id == community_id).first()
    if community:
        db.delete(community)
        db.commit()
    return community

def list_communities(db: Session, keyword: Optional[str] = None):
    query = db.query(Community)
    if keyword:
        query = query.filter(Community.title.contains(keyword))
    return query.all()
