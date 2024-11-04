# PLKIT
> 🪴 PLKIT, get EASY&SMART Farm R&D

**An Integrated Smart Farm Management and Community Platform**

---

## Quick Links to Project Documentation

- **[PLKIT-HW_Prototype_and_Specifications](./.docs/PLKIT-HW_Prototype_and_Specifications.md)**: Documentation for the hardware aspects of the PLKIT smart farm system, including layout, specifications, and prototype information.
- **[AI.analysis README](./AI.analysis/README.md)**: Detailed documentation for the AI.analysis module, which manages time series forecasting models using TSMixer.
- **[AI.chat README](./AI.chat/README.md)**: Documentation for the AI.chat module, an AI-powered chatbot for smart farm management using GPT-4.
- **[BE.platform README](./BE.platform/README.md)**: Backend service documentation for the community and market platform.
- **[EM.modules README](./EM.modules/README.md)**: Overview of embedded modules for smart farm control using BLE.
- **[FE.dashboard README](./FE.dashboard/README.md)**: Frontend dashboard documentation built on Enact and Node-RED for smart farm management.
- **[FE.web README](./FE.web/README.md)**: Web platform documentation for data sharing and community features.


---

## webOS Utilization Benefits

> [!IMPORTANT]  
> **Effortless Deployment with IPK Packaging**  
> PLKIT is packaged as an IPK file specifically for webOS, allowing seamless installation and maintenance on webOS devices. This ensures broad compatibility and ease of use across various webOS platforms, enhancing accessibility.

> [!TIP]  
> **Optimized Multimedia Performance**  
> PLKIT maximizes the multimedia capabilities of webOS to deliver smooth, high-quality video streaming. Users can monitor their smart farm in real time, with optimal video quality tailored to the screen size of their webOS device.

> [!TIP]  
> **Support for Diverse Devices**  
> With webOS compatibility across smart TVs, smartphones, and IoT devices, PLKIT is versatile and adaptable. This allows users to manage their smart farm from a wide range of devices.

> [!NOTE]  
> **Consistent User Experience**  
> By leveraging the powerful UX framework of webOS, PLKIT offers a seamless and intuitive user experience. The Enact framework integrates naturally with webOS, providing a familiar and user-friendly interface.

---

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Modules and Features](#modules-and-features)
4. [Installation and Setup](#installation-and-setup)
5. [Usage](#usage)
6. [Contributing](#contributing)
7. [License](#license)

---

## Overview

PLKIT combines cutting-edge technologies like BLE, FastAPI, Node-RED, and Enact UI to offer a robust smart farm ecosystem. It enables seamless farm management, from real-time data monitoring and device control to community-driven data sharing and AI analysis. The goal is to optimize agricultural processes and provide an accessible platform for users to manage, analyze, and share valuable farming data.

## Project Structure

```
.
|-- AI.analysis          # FastAPI-based analysis service using TSMixer
|-- AI.chat              # Smart Farm Expert Chatbot using GPT-4 and FastAPI
|-- BE.platform          # Backend service for community and market operations
|-- EM.modules           # Embedded modules for smart farm control with BLE
|-- FE.dashboard         # Frontend dashboard built on Enact and Node-RED
|-- FE.library           # Component library for the frontend
|-- FE.web               # Web platform for data sharing and community features
|-- .docs                # documents for PLKIT
`-- README.md            # This file
```

---

## Modules and Features

### 1. **AI.analysis**
   - **Description**: A FastAPI-based service for managing and deploying time series forecasting models using TSMixer.
   - **Features**:
     - Model uploading and management
     - Single data point predictions
     - Robust logging and CORS support
   - **Technologies**: FastAPI, PyTorch, MongoDB

### 2. **AI.chat**
   - **Description**: A chatbot application leveraging GPT-4 to provide smart farm advice and support.
   - **Features**:
     - User persona setup for tailored responses
     - Conversation logging for analysis
     - AWS deployment-ready
   - **Technologies**: FastAPI, OpenAI API, Uvicorn

### 3. **BE.platform**
   - **Description**: A FastAPI-based backend for managing community and market functionalities.
   - **Features**:
     - User authentication (JWT-based)
     - Community and market APIs
     - Status management and CORS support
   - **Technologies**: FastAPI, SQLAlchemy, JWT

### 4. **EM.modules**
   - **Description**: Embedded systems for smart farm control using BLE.
   - **Features**:
     - BLE communication for Wi-Fi and MQTT setup
     - Real-time control of LED, fan, heater, and water level
     - Node-RED for automation
   - **Technologies**: Arduino IDE, Node-RED, ESP32

### 5. **FE.dashboard**
   - **Description**: An Enact-based dashboard for monitoring and controlling smart farms.
   - **Features**:
     - Real-time sensor data visualization
     - Remote device control using WebSocket
     - AI-based growth prediction
   - **Technologies**: Enact, Node-RED, webOS

### 6. **FE.library**
   - **Description**: A component library for reusable UI elements in the frontend.
   - **Technologies**: React, Styled-Components

### 7. **FE.web**
   - **Description**: A web platform for smart farm data sharing and community interaction.
   - **Features**:
     - Knowledge sharing and data trading
     - Secure user authentication
     - Community-driven content management
   - **Technologies**: React, Axios, Styled-Components

---

## Installation and Setup

### Prerequisites
- **Python 3.8+**
- **Node.js and npm**
- **MongoDB**
- **Arduino IDE (for EM.modules)**
- **Virtual environment tools**

### Setup Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/PLKIT/PLKIT.git
   cd PLKIT
   ```

2. **Set Up Virtual Environments for Python Projects**
   - Navigate to `AI.analysis`, `AI.chat`, and `BE.platform` directories and create virtual environments.
   - Install dependencies:
     ```bash
     python -m venv venv
     source venv/bin/activate  # On Windows: venv\Scripts\activate
     pip install -r requirements.txt
     ```

3. **Install Node.js Dependencies for Frontend Projects**
   - Navigate to `FE.dashboard`, `FE.library`, and `FE.web` directories and run:
     ```bash
     npm install
     ```

4. **Configure Environment Variables**
   - Use `.env` files for sensitive information like database URIs and API keys.

---

## Usage

### Starting Backend Services
- **AI.analysis**:
  ```bash
  uvicorn app.main:app --reload
  ```
- **AI.chat**:
  ```bash
  uvicorn app:app --reload
  ```
- **BE.platform**:
  ```bash
  uvicorn main:app --reload
  ```

### Running Frontend Applications
- **FE.dashboard**: Use `npm start` to launch the Enact dashboard.
- **FE.web**: Use `npm start` to run the React-based web platform.

### Using Embedded Modules
- Upload the Arduino code to ESP32 devices.
- Monitor and control the smart farm via the dashboard.

---

## Contributing

We welcome contributions! Follow these steps:

1. **Fork the repository** and create a feature branch.
2. **Implement your changes** and write clear commit messages.
3. **Submit a pull request** for review.

### Guidelines
- Follow PEP 8 for Python code.
- Use meaningful names for commits and branches.
- Ensure your code does not break existing features.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

© 2024 PLKIT. All rights reserved.

---

**Enjoy smart farming with PLKIT!** 🌱
