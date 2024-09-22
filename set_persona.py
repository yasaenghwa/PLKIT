from openai import OpenAI
from pydantic import BaseModel
from set_connection import get_api_key

OPENAI_API_KEY = get_api_key()
client = OpenAI(api_key=OPENAI_API_KEY)


class UserPersona(BaseModel):
    name: str
    age: int
    location: str
    occupation: str
    interests: str
    hobbies: str
    personality: str
    background: str


def get_chat_response(messages, model="gpt-4o-mini"):
    response = client.chat.completions.create(model=model, messages=messages)
    return response.choices[0].message.content


def main():
    print("Welcome to the chatbot! Type 'exit' to end the conversation.")
    messages = [
        {
            "role": "system",
            "content": "You are an expert with background knowledge on problems that arise related to crop cultivation in smart farms.",
        }
    ]

    while True:
        user_input = input("You: ")
        if user_input.lower() == "exit":
            break

        messages.append({"role": "user", "content": user_input})
        response = get_chat_response(messages)
        print(f"Bot: {response}")
        messages.append({"role": "assistant", "content": response})


if __name__ == "__main__":
    main()
