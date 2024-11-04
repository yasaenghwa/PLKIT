# app/routers/communities.py
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from models.user import User
from models.community import Community
from sqlalchemy.orm import Session
from typing import List, Optional
import crud, schemas
from database import get_db
from uuid import uuid4
from pathlib import Path
from security import get_current_user

router = APIRouter(prefix="/communities", tags=["Community"])

# 이미지 저장 경로 설정
UPLOAD_DIR = Path("uploads/community_images")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/", response_model=schemas.community.CommunityResponse)
async def create_community(
    community: schemas.community.CommunityCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    새로운 커뮤니티 게시물을 생성합니다.
    """
    # 현재 인증된 사용자 정보를 사용해 작성자를 설정
    community.writer_id = current_user.id
    new_community = crud.community.create_community(db, community)
    return new_community

@router.get("/{community_id}", response_model=schemas.community.CommunityResponse)
async def get_community(community_id: int, db: Session = Depends(get_db)):
    """
    특정 커뮤니티 게시물의 상세 정보를 조회합니다.
    """
    community = crud.community.get_community(db, community_id)
    if not community:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="게시물을 찾을 수 없습니다.")
    return community

@router.patch("/{community_id}", response_model=schemas.community.CommunityResponse)
async def update_community(
    community_id: int, 
    community_update: schemas.community.CommunityUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    특정 커뮤니티 게시물을 수정합니다.
    """
    # 게시물 조회
    community = db.query(Community).filter(Community.id == community_id).first()
    if not community:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="게시물을 찾을 수 없습니다.")

    # 작성자가 아닌 경우 권한 거부
    if community.writer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="권한이 없습니다.")

    # 게시물 업데이트
    for key, value in community_update.dict(exclude_unset=True).items():
        setattr(community, key, value)

    db.commit()
    db.refresh(community)

    return community

@router.delete("/{community_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_community(
    community_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    특정 커뮤니티 게시물을 삭제합니다.
    """
    # 게시물 조회
    community = crud.community.get_community(db, community_id)
    if not community:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="게시물을 찾을 수 없습니다.")
    
    # 작성자가 아닌 경우 권한 거부
    if community.writer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="권한이 없습니다.")

    # 게시물 삭제
    crud.community.delete_community(db, community_id)
    return

@router.get("/", response_model=List[schemas.community.CommunitySearchResponse])
async def list_communities(keyword: Optional[str] = None, db: Session = Depends(get_db)):
    """
    모든 커뮤니티 게시물을 조회하거나 키워드로 필터링합니다.
    """
    # 커뮤니티 게시물 목록을 조회합니다
    communities = crud.community.list_communities(db, keyword)

    # writer 정보를 포함한 응답 데이터 생성
    response_data = []
    for community in communities:
        # writer_id를 기반으로 User를 조회합니다
        writer = db.query(User).filter(User.id == community.writer_id).first()

        # 응답 데이터에 writer 정보를 추가합니다
        community_data = {
            "id": community.id,
            "title": community.title,
            "content": community.content,
            "image": community.image,
            "created_at": community.created_at,
            "writer_id": community.writer_id,
            "writer_name": writer.name,
            "answers": []  # answers는 현재 빈 리스트로 설정합니다
        }
        response_data.append(community_data)

    return response_data

@router.post("/{community_id}/image", status_code=status.HTTP_201_CREATED)
async def upload_image(
    community_id: int, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    특정 커뮤니티 게시물의 이미지를 업로드하고 데이터베이스에 저장합니다.
    """
    # community_id로 커뮤니티 게시물 조회
    community = db.query(Community).filter(Community.id == community_id).first()
    if not community:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="게시물을 찾을 수 없습니다.")

    # 작성자가 아닌 경우 권한 거부
    if community.writer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="권한이 없습니다.")

    # 이미지 파일 이름 생성
    image_filename = f"{uuid4()}{Path(file.filename).suffix}"
    image_path = UPLOAD_DIR / image_filename

    # 파일 저장
    with open(image_path, "wb") as buffer:
        buffer.write(file.file.read())

    # 이미지 경로를 데이터베이스에 업데이트
    community.image = image_filename
    db.commit()

    # 업로드된 이미지의 경로를 반환
    return {"filename": image_filename}

@router.get("/{community_id}/image", response_class=FileResponse)
async def get_community_image(community_id: int, db: Session = Depends(get_db)):
    """
    특정 커뮤니티 게시물의 이미지를 반환합니다.
    """
    # community_id로 커뮤니티 게시물 조회
    community = db.query(Community).filter(Community.id == community_id).first()
    if not community:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="게시물을 찾을 수 없습니다.")

    # 이미지 경로 확인
    if not community.image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="이미지를 찾을 수 없습니다.")

    image_path = UPLOAD_DIR / community.image

    # 이미지 파일이 존재하는지 확인
    if not image_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="이미지를 찾을 수 없습니다.")

    # 이미지 파일 반환
    return FileResponse(image_path)
