import logging
import os
from typing import List, Optional

from openai import OpenAI, OpenAIError
from pydantic import BaseModel, Field, ValidationError

from set_connection import get_api_key

logging.basicConfig(
    filename='chatbot.log',
    filemode='a',
    format='%(asctime)s - %(levelname)s - %(message)s',
    level=logging.INFO,
    encoding='utf-8'
)

OPENAI_API_KEY = get_api_key()
client = OpenAI(api_key=OPENAI_API_KEY)

class UserPersona(BaseModel):
    name: str = Field(..., example="스마트팜 전문가")
    age: int = Field(..., gt=0, example=40)
    location: str = Field(..., example="서울, 대한민국")
    occupation: str = Field(..., example="스마트팜 컨설턴트")
    interests: str = Field(..., example="스마트 농업, IoT, 데이터 분석")
    hobbies: str = Field(..., example="농작물 연구, 기술 개발")
    personality: str = Field(..., example="분석적이고 문제 해결에 능함")
    background: str = Field(..., example="농업공학 박사, 10년 이상의 스마트팜 운영 경험")

def get_chat_response(messages: List[dict], model: str = "gpt-4") -> Optional[str]:
    try:
        response = client.chat.completions.create(model=model, messages=messages)
        content = response.choices[0].message.content.strip()
        logging.info(f"Assistant: {content}")
        return content
    except OpenAIError as e:
        logging.error(f"OpenAI API error: {e}")
        return "죄송합니다. 현재 서비스를 이용할 수 없습니다."
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return "알 수 없는 오류가 발생했습니다."

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

def view_logs() -> None:
    try:
        with open('chatbot.log', 'r', encoding='utf-8') as log_file:
            logs = log_file.read()
        print("\n--- Recent Logs ---")
        print(logs[-1000:])
        print("--- End of Logs ---\n")
    except Exception as e:
        print(f"로그를 읽는 중 오류가 발생했습니다: {e}")

def main():
    print("스마트팜 챗봇에 오신 것을 환영합니다! 'exit'을 입력하여 대화를 종료하세요.")
    print("관리자 전용 명령어: '/show_logs'로 로그를 확인할 수 있습니다.")

    persona = initialize_persona()
    system_message = build_system_message(persona)
    messages = [system_message]

    while True:
        try:
            user_input = input("You: ").strip()
            if user_input.lower() == "exit":
                print("대화를 종료합니다. 감사합니다!")
                logging.info("User exited the conversation.")
                break

            if user_input.lower() == "/show_logs":
                view_logs()
                continue

            if not user_input:
                print("Bot: 입력이 비어 있습니다. 질문을 입력해주세요.")
                continue

            messages.append({"role": "user", "content": user_input})
            response = get_chat_response(messages)
            if response:
                print(f"Bot: {response}")
                messages.append({"role": "assistant", "content": response})
            else:
                print("Bot: 응답을 가져오는 중 오류가 발생했습니다.")
        except KeyboardInterrupt:
            print("\n대화를 종료합니다. 감사합니다!")
            logging.info("User interrupted the conversation.")
            break
        except Exception as e:
            logging.error(f"Unexpected error in main loop: {e}")
            print("알 수 없는 오류가 발생했습니다. 다시 시도해주세요.")

if __name__ == "__main__":
    main()
