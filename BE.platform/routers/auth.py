# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
import jwt
from pydantic import BaseModel, EmailStr
from typing import Optional
import crud, schemas, database
from config import settings
from schemas.auth import Token, TokenData, UserResponse, UserCreate
from database import get_db

# 설정된 OAuth2PasswordBearer 인스턴스 생성
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

router = APIRouter(prefix="/auth", tags=["Auth"])


# JWT 액세스 토큰 생성 함수
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    JWT 액세스 토큰을 생성합니다.

    Args:
        data (dict): 토큰에 포함할 데이터.
        expires_delta (Optional[timedelta]): 토큰 만료 시간 설정. 기본값은 설정 파일의 시간.

    Returns:
        str: 생성된 JWT 토큰 문자열.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


# 현재 사용자 검증 함수
async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    """
    JWT 토큰을 통해 현재 사용자를 확인합니다.

    Args:
        token (str): 인증 헤더의 JWT 토큰.
        db (Session): 데이터베이스 세션 종속성.

    Returns:
        User: 인증된 사용자의 User 객체.

    Raises:
        HTTPException: 토큰이 유효하지 않거나 사용자를 찾을 수 없는 경우 발생.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="자격 증명을 확인할 수 없습니다.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except jwt.PyJWTError:
        raise credentials_exception
    user = crud.user.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user


# 로그인 엔드포인트
@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """
    사용자를 인증하고 JWT 액세스 토큰을 반환합니다.

    Args:
        form_data (OAuth2PasswordRequestForm): 사용자의 이메일과 비밀번호를 포함.
        db (Session): 데이터베이스 세션 종속성.

    Returns:
        dict: 액세스 토큰과 토큰 타입이 포함된 응답.

    Raises:
        HTTPException: 사용자의 인증 정보가 올바르지 않을 때 발생.
    """
    user = crud.user.get_user_by_email(db, email=form_data.username)
    if not user or not crud.user.verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 일치하지 않습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


# 회원가입 엔드포인트
@router.post("/signup", response_model=UserResponse)
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    """
    새로운 사용자를 등록합니다.

    Args:
        user (UserCreate): 새 사용자 정보 (이메일, 비밀번호 등 포함).
        db (Session): 데이터베이스 세션 종속성.

    Returns:
        UserResponse: 새로 생성된 사용자에 대한 정보.

    Raises:
        HTTPException: 이메일이 이미 등록된 경우 발생.
    """
    db_user = crud.user.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이메일이 이미 등록되어 있습니다.",
        )
    new_user = crud.user.create_user(db=db, user=user)
    return new_user
