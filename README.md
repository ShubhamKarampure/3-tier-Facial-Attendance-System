# Facial Attendance System

## Overview
The **Facial Attendance System** is an AI-powered attendance management solution that leverages facial recognition technology using the DeepFace model. It follows a **3-tier architecture**, where the frontend, backend, and database run on separate local machines and communicate with each other seamlessly.

## 3-Tier Architecture
The system is structured as follows:

1. **Frontend (User Interface):**
   - Built using React.
   - Handles user interactions and captures live webcam feeds.
   - Sends facial images to the backend for authentication.

2. **Backend (Processing and Business Logic):**
   - Developed using Flask.
   - Implements facial recognition using the DeepFace model.
   - Communicates with the database to verify and store attendance records.

3. **Database (Storage Layer):**
   - Stores registered user images and attendance logs.
   - Manages authentication and attendance history.

## Features
- Real-time facial recognition for attendance marking.
- Secure and scalable architecture with independent tiers.
- Database-backed user authentication and attendance tracking.
- Optimized performance with DeepFace model integration.

## Technology Stack
### Frontend:
- React
- Webcam access via browser

### Backend:
- Python 3.12 (Flask API)
- DeepFace for facial recognition
- OpenCV for image processing

### Database:
- PostgreSQL / MySQL (or any preferred database)

## System Flow
1. The **frontend** captures the user's image using the webcam.
2. The image is sent to the **backend**, where DeepFace processes and matches it with stored records.
3. Upon successful authentication, the **backend** updates the **database** with the attendance record.
4. The **frontend** displays the success/failure status.

## Next Steps
For detailed setup instructions, refer to the individual README files in the **frontend** and **backend** directories.

