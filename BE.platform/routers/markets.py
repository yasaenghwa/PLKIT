from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from models.user import User
from models.market import Market
from security import get_current_user
from sqlalchemy.orm import Session
from typing import List, Optional
import crud, schemas
from database import get_db
from uuid import uuid4
from pathlib import Path

router = APIRouter(prefix="/markets", tags=["Market"])

# 이미지 저장 경로 설정
UPLOAD_DIR = Path("uploads/market_images")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/", response_model=schemas.market.MarketResponse)
async def create_market(
    market: schemas.market.MarketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    새로운 마켓 게시물을 생성합니다.
    """
    market.writer_id = current_user.id
    new_market = crud.market.create_market(db, market)
    return new_market

@router.patch("/{market_id}", response_model=schemas.market.MarketResponse)
async def update_market(
    market_id: int,
    market_update: schemas.market.MarketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    특정 마켓 게시물을 수정합니다.
    """
    updated_market = crud.market.update_market(db, market_id, market_update, current_user.id)
    if not updated_market:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="게시물을 찾을 수 없습니다.")
    return updated_market

@router.get("/{market_id}", response_model=schemas.market.MarketResponse)
async def get_market(market_id: int, db: Session = Depends(get_db)):
    """
    특정 마켓 게시물의 상세 정보를 조회합니다.
    """
    market = crud.market.get_market(db, market_id)
    if not market:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="게시물을 찾을 수 없습니다.")
    return market

@router.delete("/{market_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_market(market_id: int, db: Session = Depends(get_db)):
    """
    특정 마켓 게시물을 삭제합니다.
    """
    market = crud.market.delete_market(db, market_id)
    if not market:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="게시물을 찾을 수 없습니다.")
    return

@router.get("/", response_model=List[schemas.market.MarketResponse])
async def list_markets(keyword: Optional[str] = None, db: Session = Depends(get_db)):
    """
    모든 마켓 게시물 목록을 조회하거나 검색어로 필터링합니다.
    """
    markets = crud.market.list_markets(db, keyword)
    return markets

@router.post("/{market_id}/image", status_code=status.HTTP_201_CREATED)
async def upload_market_image(
    market_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    특정 마켓 게시물의 이미지를 업로드하고 데이터베이스에 저장합니다.
    """
    # market_id로 마켓 게시물 조회
    market = db.query(Market).filter(Market.id == market_id).first()
    if not market:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="게시물을 찾을 수 없습니다.")
    
    # 작성자가 아닌 경우 권한 거부
    if market.writer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="권한이 없습니다.")
    
    # 이미지 파일 이름 생성
    image_filename = f"{uuid4()}{Path(file.filename).suffix}"
    image_path = UPLOAD_DIR / image_filename

    # 파일 저장
    with open(image_path, "wb") as buffer:
        buffer.write(file.file.read())
    

    # 이미지 경로를 데이터베이스에 업데이트
    market.image = image_filename
    db.commit()

    # 업로드된 이미지의 경로를 반환
    return {"filename": image_filename}

@router.get("/{market_id}/image", response_class=FileResponse)
async def get_market_image(market_id: int, db: Session = Depends(get_db)):
    """
    특정 마켓 게시물의 이미지를 반환합니다.
    """
    # market_id로 마켓 게시물 조회
    market = db.query(Market).filter(Market.id == market_id).first()
    if not market:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="게시물을 찾을 수 없습니다.")

    # 이미지 경로 확인
    if not market.image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="이미지를 찾을 수 없습니다.")

    image_path = UPLOAD_DIR / market.image

    # 이미지 파일이 존재하는지 확인
    if not image_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="이미지를 찾을 수 없습니다.")

    # 이미지 파일 반환
    return FileResponse(image_path)
