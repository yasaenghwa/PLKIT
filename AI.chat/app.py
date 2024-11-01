import logging
import os
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field, ValidationError

import openai
from set_connection import get_api_key  # Ensure this module is available

# Initialize logging
logging.basicConfig(
    filename='chatbot.log',
    filemode='a',
    format='%(asctime)s - %(levelname)s - %(message)s',
    level=logging.INFO,
    encoding='utf-8'
)

# Initialize OpenAI client
OPENAI_API_KEY = get_api_key()
openai.api_key = OPENAI_API_KEY

# Define Pydantic models
class UserPersona(BaseModel):
    name: str = Field(..., example="스마트팜 전문가")
    age: int = Field(..., gt=0, example=40)
    location: str = Field(..., example="서울, 대한민국")
    occupation: str = Field(..., example="스마트팜 컨설턴트")
    interests: str = Field(..., example="스마트 농업, IoT, 데이터 분석")
    hobbies: str = Field(..., example="농작물 연구, 기술 개발")
    personality: str = Field(..., example="분석적이고 문제 해결에 능함")
    background: str = Field(..., example="농업공학 박사, 10년 이상의 스마트팜 운영 경험")

class ChatRequest(BaseModel):
    messages: List[dict] = Field(
        ...,
        example=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Hello!"},
        ]
    )

class ChatResponse(BaseModel):
    response: str

# Initialize FastAPI app
app = FastAPI(
    title="Smart Farm Chatbot API",
    description="A FastAPI server for interacting with a Smart Farm expert chatbot.",
    version="1.0.0"
)

def initialize_persona() -> UserPersona:
    persona = UserPersona(
        name="스마트팜 전문가",
        age=40,
        location="서울, 대한민국",
        occupation="스마트팜 컨설턴트",
        interests="스마트 농업, IoT, 데이터 분석",
        hobbies="농작물 연구, 기술 개발",
        personality="분석적이고 문제 해결에 능함",
        background="농업공학 박사, 10년 이상의 스마트팜 운영 경험"
    )
    logging.info(f"Initialized UserPersona: {persona}")
    return persona

def build_system_message(persona: UserPersona) -> dict:
    system_content = (
        f"당신은 {persona.name}입니다. {persona.age}세이며, {persona.occupation}로 "
        f"{persona.location}에 거주하고 있습니다. 당신의 관심사는 {persona.interests}이고, "
        f"취미는 {persona.hobbies}입니다. 성격은 {persona.personality}이며, "
        f"배경은 {persona.background}입니다. 스마트 팜의 농작물 재배와 관련된 문제에 대한 전문가로서, "
        "스마트 팜은 아크릴로 만든 박스형 장치로 외부와 격리되어 있으며, 내부 환경을 설정할 수 있는 센서가 있습니다."
    )
    return {
        "role": "system",
        "content": system_content
    }

def get_chat_response(messages: List[dict], model: str = "gpt-4") -> Optional[str]:
    try:
        response = openai.ChatCompletion.create(model=model, messages=messages)
        content = response.choices[0].message['content'].strip()
        logging.info(f"Assistant: {content}")
        return content
    except openai.error.OpenAIError as e:
        logging.error(f"OpenAI API error: {e}")
        return "죄송합니다. 현재 서비스를 이용할 수 없습니다."
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return "알 수 없는 오류가 발생했습니다."

@app.on_event("startup")
def startup_event():
    """
    Initialize the user persona and log it at startup.
    """
    app.state.persona = initialize_persona()
    app.state.system_message = build_system_message(app.state.persona)
    logging.info("FastAPI server started and persona initialized.")

@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(chat_request: ChatRequest):
    """
    Endpoint to handle chat messages.

    Expects a list of messages (including system message) and returns the assistant's response.
    """
    messages = chat_request.messages.copy()

    # Ensure the first message is the system message
    if not messages or messages[0].get("role") != "system":
        messages.insert(0, app.state.system_message)

    user_input = messages[-1].get("content", "").strip()

    if not user_input:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="입력이 비어 있습니다. 질문을 입력해주세요.")

    logging.info(f"User: {user_input}")

    response = get_chat_response(messages)

    if response is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="응답을 가져오는 중 오류가 발생했습니다.")

    return ChatResponse(response=response)

@app.get("/logs", response_class=PlainTextResponse)
def get_logs():
    """
    Endpoint to retrieve the last 1000 characters of the chatbot log.
    """
    try:
        with open('chatbot.log', 'r', encoding='utf-8') as log_file:
            logs = log_file.read()
        recent_logs = logs[-1000:]
        return recent_logs
    except Exception as e:
        logging.error(f"Error reading logs: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="로그를 읽는 중 오류가 발생했습니다.")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Smart Farm Chatbot API. Use /docs for API documentation."}
