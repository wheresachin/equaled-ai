# EqualEd

EqualEd is an inclusive and highly accessible educational platform designed to empower students and provide teachers with intuitive management tools.

## 🚨 The Problem

Access to quality education is often limited for students with physical disabilities or those encountering language barriers. Traditional digital learning platforms frequently lack robust accessibility features—such as reliable voice control, eye tracking, and hand tracking. Furthermore, they often struggle to accommodate bilingual users or provide teachers with the necessary tools to efficiently monitor and adapt to individual student progress.

## 💡 The Solution

EqualEd bridges the educational accessibility gap by integrating cutting-edge assistive technologies directly into the learning experience. The platform features an advanced accessibility suite—including Voice Assistance, Eye Tracking, and Hand Tracking—enabling students to interact seamlessly with educational content. With distinct role-based interfaces, teachers are equipped with powerful tools to create tailored lessons, manage quizzes, and track real-time progress, creating a truly personalized, inclusive, and barrier-free environment for all learners.

## ✨ Features

- **Role-Based Dashboards**: Customized interfaces and functionalities tailored specifically for Students and Teachers.
- **Advanced Accessibility Suite**: Built-in Eye Tracking, Hand Tracking, and Voice Assistant features designed to empower students with disabilities.
- **Bilingual Voice Commands**: Robust voice control system supporting both English and Hindi (Hinglish) for a more inclusive user experience.
- **Comprehensive Teacher Tools**: Easy-to-use tools for creating lessons, generating quizzes, reviewing student submissions, and monitoring overall progress.
- **AI-Powered Assistance**: Seamless integration with the Gemini API to provide intelligent learning support and automated functionalities.
- **Modern & Responsive UI**: A fully responsive, modern web application built with React, Vite, and Tailwind CSS.
- **Secure Authentication**: JWT-based authentication to keep user data and progress secure.

## 🚀 How to Run It

### Prerequisites

- Node.js (v20.0.0 or higher)
- MongoDB instance (local or Atlas)
- Google Gemini API Key

### Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Create a `.env` file in the `backend` directory based on your requirements. You will need variables such as:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## 👥 Contributors

- **Sachin Kumar**
- **Rajiya Kumari**
- **Raunak Azim**
- **Anita Kumari**
