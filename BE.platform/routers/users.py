from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import crud, schemas, database
from schemas.user import UserResponse, UserLinkCreate, UserLinkResponse
import jwt
from typing import List, Optional
from config import settings
from uuid import uuid4
from pathlib import Path
from models.user import User, UserLink
from security import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

# 프로필 이미지 저장 경로 설정
UPLOAD_DIR = Path("uploads/avatars")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.get("/me", response_model=UserResponse)
async def read_user_me(
    current_user: schemas.user.UserResponse = Depends(get_current_user),
):
    """
    현재 로그인한 사용자의 정보를 반환합니다.
    """
    return current_user

@router.patch("/me/name", response_model=UserResponse)
async def update_user_name(
    name: Optional[str] = None,
    db: Session = Depends(database.get_db),
    current_user: schemas.user.UserResponse = Depends(get_current_user),
):
    """
    현재 로그인된 사용자의 이름을 업데이트합니다.
    - `name`: 새로운 이름
    """
    if name:
        update_data = {"name": name}
        updated_user = crud.user.update_user(db, user_id=current_user.id, update_data=update_data)
        return updated_user
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="이름을 제공해야 합니다."
        )

@router.patch("/me/avatar", response_model=UserResponse)
async def update_user_avatar(
    avatar: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: schemas.user.UserResponse = Depends(get_current_user),
):
    """
    현재 로그인된 사용자의 프로필 이미지를 업데이트합니다.
    - `avatar`: 프로필 이미지 파일 업로드
    """
    # 프로필 이미지 업로드 및 저장
    avatar_filename = f"{uuid4()}{Path(avatar.filename).suffix}"
    avatar_path = UPLOAD_DIR / avatar_filename

    # 파일 저장
    with open(avatar_path, "wb") as buffer:
        buffer.write(avatar.file.read())
    
    # 기존 프로필 이미지 삭제 (옵션)
    if current_user.avatar:
        old_avatar_path = Path(current_user.avatar)
        if old_avatar_path.exists():
            old_avatar_path.unlink()

    # DB에 저장할 경로
    update_data = {"avatar": str(avatar_filename)}
    updated_user = crud.user.update_user(db, user_id=current_user.id, update_data=update_data)
    return updated_user

@router.get("/me/avatar", response_class=FileResponse)
async def get_user_avatar(
    current_user: schemas.user.UserResponse = Depends(get_current_user),
):
    """
    현재 로그인된 사용자의 프로필 이미지를 반환합니다.
    """
    if not current_user.avatar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="프로필 이미지가 설정되지 않았습니다."
        )
    
    avatar_path = UPLOAD_DIR / current_user.avatar
    if not avatar_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="프로필 이미지를 찾을 수 없습니다."
        )
    
    return FileResponse(avatar_path)

@router.get("/{id}/avatar", response_class=FileResponse)
async def get_user_avatar_by_id(
    id: int, db: Session = Depends(database.get_db)
):
    """
    특정 사용자의 프로필 이미지를 반환합니다.
    - `id`: 사용자 ID
    """
    
    # 사용자 조회
    user = crud.user.get_user_by_id(db, user_id=id)   
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="사용자를 찾을 수 없습니다."
        )

    # 프로필 이미지 경로 확인
    if not user.avatar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="프로필 이미지가 설정되지 않았습니다."
        )

    avatar_path = UPLOAD_DIR / user.avatar
    if not avatar_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="프로필 이미지를 찾을 수 없습니다."
        )

    return FileResponse(avatar_path)

@router.get("/{id}/name", response_model=dict)
async def get_user_name_by_id(
    id: int, db: Session = Depends(database.get_db)
):
    """
    특정 사용자의 이름을 반환합니다.
    - `id`: 사용자 ID
    """
    user = crud.user.get_user_by_id(db, user_id=id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="사용자를 찾을 수 없습니다."
        )
    return {"name": user.name}

### 1. POST: Add a new user link
@router.post("/link", response_model=UserLinkResponse, status_code=status.HTTP_201_CREATED)
async def add_user_link(
    link_data: UserLinkCreate,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user)
):
    """
    사용자 링크를 추가합니다.
    """
    new_link = crud.user.add_user_link(db, user_id=current_user.id, link_data=link_data)
    return new_link

### 2. GET: Retrieve all links for the current user
@router.get("/me/links", response_model=List[UserLinkResponse])
async def get_user_links(
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user)
):
    """
    현재 사용자의 모든 링크를 조회합니다.
    """
    links = crud.user.get_user_links(db, user_id=current_user.id)
    return links

### 3. PATCH: Update a specific user link
@router.patch("/link/{link_id}", response_model=UserLinkResponse)
async def update_user_link(
    link_id: int,
    link_data: UserLinkCreate,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user)
):
    """
    특정 사용자 링크를 업데이트합니다.
    """
    updated_link = crud.user.update_user_link(db, user_id=current_user.id, link_id=link_id, link_data=link_data)
    if not updated_link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="링크를 찾을 수 없습니다.")
    return updated_link

### 4. DELETE: Remove a specific user link
@router.delete("/link/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_link(
    link_id: int,
    db: Session = Depends(database.get_db),
    current_user: User = Depends(get_current_user)
):
    """
    특정 사용자 링크를 삭제합니다.
    """
    success = crud.user.delete_user_link(db, user_id=current_user.id, link_id=link_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="링크를 찾을 수 없습니다.")
    return
