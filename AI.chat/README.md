# PLKIT-AI.chat

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python Version](https://img.shields.io/badge/python-3.9%2B-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.78.0-brightgreen.svg)

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Dependencies](#dependencies)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Overview

```mermaid
flowchart TD
    %% 시작
    A[사용자] -->|HTTP POST 요청| B[/chat 엔드포인트/]
    
    %% 요청 처리
    B --> C[요청 본문 파싱]
    C --> D{유효성 검사}
    D -->|유효| E[메시지 추출]
    D -->|유효하지 않음| F[400 오류 반환]
    
    %% 시스템 메시지 추가
    E --> G{시스템 메시지 포함 여부 확인}
    G -->|포함됨| H[사용자 입력 추출]
    G -->|포함되지 않음| I[시스템 메시지 추가]
    I --> H
    
    %% 사용자 입력 처리
    H --> J{입력 내용 확인}
    J -->|비어 있음| K[400 오류 반환]
    J -->|유효| L[사용자 입력 로그 기록]
    
    %% OpenAI API 호출
    L --> M[OpenAI API 호출]
    M --> N{API 응답 확인}
    N -->|성공| O[응답 내용 추출 및 로그 기록]
    N -->|실패| P[500 오류 반환]
    
    %% 응답 반환
    O --> Q[응답 반환]
    Q --> A
    
    %% 로그 엔드포인트
    A -->|GET /logs 요청| R[/logs 엔드포인트/]
    R --> S[로그 파일 읽기]
    S --> T[최근 1000자 반환]
    T --> A
    
    %% 에러 처리
    F --> U[400 Bad Request]
    K --> U
    P --> V[500 Internal Server Error]
```
PLKIT-AI.chat is a chatbot application that emulates a **Smart Farm Expert**. Built on FastAPI, this application leverages OpenAI's GPT-4 API to facilitate natural and engaging conversations with users. By setting up user personas, the chatbot provides professional responses tailored to specific fields. Additionally, it manages conversation logs for future analysis and monitoring. Designed for seamless deployment, PLKIT-AI.chat can be easily hosted on cloud services such as AWS EC2.

## Project Structure

```
PLKIT-AI.chat/
├── app.py # FastAPI application main file
├── set_persona.py # User persona setup and chatbot logic
├── set_connection.py # OpenAI API key configuration
├── requirements.txt # Project dependencies list
├── chatbot.log # Application log file
├── README.md # Project documentation
├── config.conf # configuration file
└── .gitignore # Git ignore file
```

## Features

- **User Persona Setup**: Define user personas with specific roles and backgrounds to ensure consistent and relevant conversation experiences.
- **OpenAI GPT-4 Integration**: Utilize the latest AI models to generate natural and contextually appropriate responses.
- **Log Management**: Save conversation logs to files for subsequent analysis and monitoring.
- **FastAPI-based API**: Provide a RESTful API that supports communication with various clients.
- **AWS Deployment Support**: Facilitate easy deployment on AWS EC2 and other AWS services with provided configurations.

`## Getting Started

This section outlines how to set up and run the project locally.

### Dependencies

The project relies on the following major dependencies:

- Python 3.9 or higher
- FastAPI
- Uvicorn
- OpenAI
- Pydantic
- Git

### Installation

1. **Clone the Repository**

   ```
   git clone https://github.com/yasaenghwa/PLKIT-AI.chat.git
   cd PLKIT-AI.chat`
   ```

2. **Set Up a Python Virtual Environment**
   `python3 -m venv venv`
   `source venv/bin/activate   # For Windows: venv\Scripts\activate`

3. **Install Dependencies**
   `pip install --upgrade pip`
   `pip install -r requirements.txt`

4. **Set Up Environment Variables**
   Configure the OpenAI API key as an environment variable. It is recommended to use a `.env` file for security.

   `export OPENAI_API_KEY='your-openai-api-key'   # For Unix/Linux
set OPENAI_API_KEY='your-openai-api-key'      # For Windows`

   Alternatively, create a `.env` file in the project root:
   `OPENAI_API_KEY=your-openai-api-key`

5. **Run the Application**
   `uvicorn app:app --host 0.0.0.0 --port 8000`

   Access the API documentation by navigating to `http://localhost:8000/docs` in your browser.

### Configuration

#### Environment Variables

- **`OPENAI_API_KEY`**: Set your OpenAI API key to enable GPT-4 integration. This key is essential for accessing OpenAI's services.

#### File Descriptions

- **`app.py`**: The main FastAPI application file that defines endpoints and application settings.
- **`set_persona.py`**: Defines user personas and handles the chatbot's response logic.
- **`set_connection.py`**: Contains functions to retrieve and manage the OpenAI API key.
- **`requirements.txt`**: Lists all Python packages required for the project.
- **`Dockerfile`**: Configuration file for building the Docker image of the application.
- **`chatbot.log`**: Log file where the application's runtime logs are stored.
- **`README.md`**: Documentation file for the project.
- **`.gitignore`**: Specifies files and directories that Git should ignore.

## Contributing

Contributions are welcome! Please follow these guidelines to contribute to the project:

1.  **Fork the Repository**

    Create a personal copy of the repository by forking it.

2.  **Create a Feature Branch**
    `git checkout -b feature/your-feature-name`

3.  **Commit Your Changes**
    `git commit -m "Add your message here"`

4.  **Push to the Branch**
    `git push origin feature/your-feature-name`

5.  **Create a Pull Request**

### Contribution Guidelines

- **Code Style**: Adhere to PEP 8 standards for Python code.
- **Testing**: Include tests for new features or bug fixes.
- **Documentation**: Update documentation to reflect changes made in your contributions.

## License

This project is licensed under the MIT License.

© 2024 PLKIT-AI.chat. All rights reserved.
