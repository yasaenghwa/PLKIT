# app/crud/user.py
from sqlalchemy.orm import Session
from models.user import User, UserLink
from schemas.user import UserCreate, UserLinkCreate
from config import settings
from passlib.context import CryptContext
from typing import Dict

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user: UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = User(email=user.email, name=user.name, password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, update_data: Dict):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    for key, value in update_data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def add_user_link(db: Session, user_id: int, link_data: UserLinkCreate):
    link = UserLink(user_id=user_id, url=link_data.url)
    db.add(link)
    db.commit()
    db.refresh(link)
    return link

def get_user_links(db: Session, user_id: int):
    return db.query(UserLink).filter(UserLink.user_id == user_id).all()

def update_user_link(db: Session, user_id: int, link_id: int, link_data: UserLinkCreate):
    link = db.query(UserLink).filter(UserLink.id == link_id, UserLink.user_id == user_id).first()
    if link:
        link.url = link_data.url
        db.commit()
        db.refresh(link)
    return link

def delete_user_link(db: Session, user_id: int, link_id: int):
    link = db.query(UserLink).filter(UserLink.id == link_id, UserLink.user_id == user_id).first()
    if link:
        db.delete(link)
        db.commit()
        return True
    return False