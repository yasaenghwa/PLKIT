# PLKIT-AI.analysis

![License](https://img.shields.io/badge/license-MIT-blue.svg)

![Python](https://img.shields.io/badge/python-3.8%2B-blue.svg)

![FastAPI](https://img.shields.io/badge/FastAPI-0.70.0-blue.svg)

## Table of Contents

- [Overview](#overview)

- [Project Structure](#project-structure)

- [Features](#features)

- [Getting Started](#getting-started)

- [Prerequisites](#prerequisites)

- [Installation](#installation)

- [Running the Application](#running-the-application)

- [Dependencies](#dependencies)

- [Configuration](#configuration)

- [CORS Settings](#cors-settings)

- [Environment Variables](#environment-variables)

- [Contributing](#contributing)

- [License](#license)

## Overview

**PLKIT-AI.analysis** is a FastAPI-based application designed for managing and deploying time series forecasting models using TSMixer. It provides functionalities to upload, manage, and perform predictions with TSMixer models, specifically tailored for single data point predictions. The application ensures secure cross-origin requests and maintains robust logging for monitoring and debugging purposes.

## Project Structure

```

PLKIT-AI.analysis/

├── app/

│ ├── init.py

│ ├── config.py

│ ├── main.py

│ ├── model_manager.py

│ ├── model.py

│ ├── schemas.py

│ ├── train_model.py

│ ├── train.log

│ └── utils.py

├── data/

│ ├── init.py

│ ├── get_from_mongodb.py

│ ├── mongo_utils.py

│ └── upload_to_mongodb.py

├── models/

│ └── # TSMixer model files (.pt)

├── server.log

├── requirements.txt

├── run.sh

├── pyproject.toml

├── config.conf

├── .gitignore

├── .env

└── README.md


```

- **app/**: Contains the main application code.

- **main.py**: FastAPI application with API endpoints.

- **model.py**: Defines the TSMixerModel class.

- **model_manager.py**: Manages model loading, training, and prediction.

- **schemas.py**: Pydantic models for request and response validation.

- **train_model.py**: Script for training and saving models.

- **utils.py**: Utility functions for data loading and preprocessing.

- **models/**: Directory where TSMixer model files are stored.

- **server.log**: Log file for application logging.

- **requirements.txt**: Lists all Python dependencies.

- **README.md**: Project documentation.

## Features

- **Model Uploading**: Upload TSMixer models (`.pt` files) via the `/upload-model/` endpoint.

- **Model Management**: List all available models using the `/models/` endpoint.

- **Time Series Prediction**: Perform predictions using TSMixer models with single data point inputs via the `/predict/` endpoint.

- **CORS Support**: Configurable Cross-Origin Resource Sharing to allow secure requests from different origins.

- **Robust Logging**: Comprehensive logging for monitoring requests, errors, and model operations.

- **Scalable Architecture**: Designed to easily add support for additional model types in the future.

## Getting Started

### Prerequisites

- **Python 3.8+**

- **MongoDB**: For storing and retrieving sensor data.

- **Git**: To clone the repository.

- **Virtual Environment**: (Optional but recommended) To manage project dependencies.

### Installation

1.  **Clone the Repository**

```bash



git  clone  https://github.com/PLKIT-AI/analysis.git



cd  analysis

```

2.  **Create a Virtual Environment**

```

python3 -m venv venv



source venv/bin/activate # On Windows: venv\Scripts\activate

```

3.  **Install Dependencies**

```

pip install --upgrade pip



pip install -r requirements.txt

```

4.  **Configure MongoDB**

Ensure MongoDB is running and accessible. Update the MongoDB URI in app/utils.py if necessary.

### Running the Application

1.  **Start the FastAPI Server**

```

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

```

The `--reload` flag enables auto-reloading during development.

2.  **Access Swagger UI**

Navigate to `http://localhost:8000/docs` to access the interactive API documentation.

## Dependencies

The project relies on the following major dependencies:

- FastAPI: Web framework for building APIs.

- Uvicorn: ASGI server for running FastAPI applications.

- Darts: Time series library for forecasting.

- PyMongo: MongoDB driver for Python.

- Pydantic: Data validation and settings management.

- Torch: PyTorch library for tensor computations.

All dependencies are listed in `requirements.txt`. Install them using:

```

pip install -r requirements.txt

```

## Configuration

### CORS Settings

Cross-Origin Resource Sharing (CORS) is configured in app/main.py using FastAPI's CORSMiddleware. Adjust the origins list to include the domains that should be allowed to access the API.

```

# app/main.py



from fastapi.middleware.cors import CORSMiddleware



origins = [

"http://localhost",

"http://localhost:3000",

"http://43.201.54.104",

# Add additional allowed origins here

]



app.add_middleware(

CORSMiddleware,

allow_origins=origins, # Allowed origins

allow_credentials=True, # Allow credentials

allow_methods=["*"], # Allowed HTTP methods

allow_headers=["*"], # Allowed HTTP headers

)

```

Note: For development purposes, you can set `allow_origins=["*"]` to allow all origins. However, **this is not recommended** for production due to security risks.

### Environment Variables

You may need to set environment variables for sensitive configurations such as MongoDB URI or server settings. Consider using a .env file and packages like python-dotenv to manage them securely.

Example `.env` file:

```

MONGODB_URI=mongodb://localhost:27017/

```

Update `app/utils.py` to load environment variables accordingly.

## Contributing

Contributions are welcome! Follow these steps to contribute to the project:

1.  **Fork the Repository**

Click the "Fork" button on the repository page to create a copy under your GitHub account.

2.  **Clone Your Fork**

```

git clone https://github.com/your-username/analysis.git

cd analysis

```

3.  **Create a New Branch**

```

git checkout -b feature/your-feature-name

```

4.  **Make Your Changes**

Implement your feature or bug fix.

5.  **Commit Your Changes**

```

git add .

git commit -m "Add your commit message"

```

5.  **Push to Your Fork**

```

git push origin feature/your-feature-name

```

6.  **Create a Pull Request**

Go to the original repository and create a pull request from your fork's branch.

**Guidelines**

- Code Style: Follow PEP 8 guidelines for Python code.

- Commit Messages: Use clear and descriptive commit messages.

- Documentation: Update the README or other documentation if necessary.

- Testing: Ensure that your changes do not break existing functionality. Add tests if applicable.

## License

This project is licensed under the MIT License.

© 2024 PLKIT-AI.analysis. All rights reserved.
