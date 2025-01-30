# Backend - Facial Attendance System

## Overview
The backend of the **Facial Attendance System** is developed using Flask and is responsible for processing facial recognition requests, managing attendance records, and interacting with the database.

## Features
- Receives images from the frontend for processing.
- Performs facial recognition using the DeepFace model.
- Verifies user identity and logs attendance.
- Communicates with the database to store and retrieve records.

## Prerequisites
- Python 3.12 installed.
- Virtual environment setup.

## Installation and Setup
```sh
# Clone the repository
git clone <backend-repo-url>

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```

## API Endpoints
- **POST /register** - Accepts an image and returns recognition results.
- **GET /mark_attendance** - Retrieves attendance records.
