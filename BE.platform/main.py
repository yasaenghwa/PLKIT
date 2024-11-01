# fastapi 기본 임포트
from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from datetime import datetime
from typing import Dict, Any
from pydantic import BaseModel
import asyncio

# dummy_routes.py에서 라우트 가져오기
from routers import dummies, statuses, auth, communities, markets, users

app = FastAPI()

# CORS 설정 추가 - 모든 도메인 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 도메인 허용
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메소드 허용 (GET, POST, PUT, DELETE 등)
    allow_headers=["*"],  # 모든 헤더 허용
)


@app.get("/")
def read_root():
    return {"PLKIT": "DEV"}


# dummy 관련 라우트 추가
app.include_router(dummies.router, prefix="/dummy", tags=["Dummies"])
# status 관련 라우트 추가
app.include_router(statuses.router, prefix="/statuses", tags=["Statuses"])
#
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(communities.router)
app.include_router(markets.router)


# 연결된 클라이언트를 관리하기 위한 매니저 클래스
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, data: bytes):
        await asyncio.gather(
            *[connection.send_bytes(data) for connection in self.active_connections],
            return_exceptions=True  # 예외 처리를 위해 추가
        )


manager = ConnectionManager()


# ESP32가 동영상 데이터를 전송하는 WebSocket 엔드포인트
@app.websocket("/ws/video_feed")
async def video_feed_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_bytes()
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# 클라이언트가 동영상을 수신하는 WebSocket 엔드포인트
@app.websocket("/ws/video")
async def video_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # 데이터를 수신할 필요는 없으므로 패스
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
