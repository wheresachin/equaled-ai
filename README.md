# EqualEd

EqualEd is an inclusive and highly accessible educational platform designed to empower students and provide teachers with intuitive management tools.

## 🚨 Problem Statement

- **Websites don't work for disabled students**: Most education websites only use keyboard and mouse. Blind or disabled students cannot use voice or eye tracking.

- **Disabled students quit school**: Without proper tools, disabled students feel left out and stop learning.

- **Only English is available**: Indian students who speak Hindi or Hinglish cannot use these websites properly.

- **Teachers cannot see student progress quickly**: Teachers have no easy way to see which students are struggling or doing well right now.

- **All students learn at the same speed**: Fast learners get bored. Slow learners fall behind. No app changes lessons based on each student.


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

## 📡 API Endpoints

The backend provides a RESTful API with the following endpoints:

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user (student, teacher, or admin)
- `POST /api/auth/login` - Login user and receive JWT token
- `POST /api/auth/forgot-password` - Send password reset email

### Lesson Endpoints (Teacher & Student)
- `GET /api/lessons` - Get all lessons (protected)
- `POST /api/lessons` - Create new lesson (teacher)
- `GET /api/lessons/:id` - Get lesson details
- `PUT /api/lessons/:id` - Update lesson (teacher)
- `DELETE /api/lessons/:id` - Delete lesson (teacher)

### Quiz Endpoints (Teacher & Student)
- `POST /api/quiz` - Create quiz for a lesson (teacher)
- `GET /api/quiz/:lessonId` - Get quiz for specific lesson

### Student Submission Endpoints
- `POST /api/submission` - Submit quiz or assignment
- `GET /api/submission` - Get all student submissions
- `GET /api/submission/lesson/:lessonId` - Get submissions for specific lesson
- `POST /api/submission/:id/feedback` - Add teacher feedback (teacher)

### Student Progress Endpoints
- `GET /api/progress/me` - Get student's own progress summary
- `POST /api/progress` - Update student progress
- `GET /api/progress` - Get class-wide progress (teacher/admin)
- `GET /api/progress/student/:studentId` - Get specific student's detailed progress (teacher/admin)

### AI Chat Endpoint
- `POST /api/ai/chat` - Chat with AI assistant powered by Google Gemini (student)

### Teacher Management Endpoints
- `GET /api/teacher/students` - Get all students in teacher's class
- `POST /api/teacher/students` - Add student by email to class
- `DELETE /api/teacher/students/:studentId` - Remove student from class
- `POST /api/teacher/tasks` - Assign task to students
- `GET /api/teacher/tasks` - Get assigned tasks

### Admin Endpoints (Admin Only)
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user details
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/tasks` - Get all system tasks

## �️ Tech Stack

### Backend
- **Framework**: Express.js (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: Google Gemini API
- **Email Service**: Nodemailer
- **Environment**: Node.js v20+

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS + PostCSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Web APIs**: 
  - Web Speech API (Voice input)
  - Canvas API (Eye tracking, Hand tracking visualization)
  - getUserMedia API (Camera access)


## �🚀 How to Run It

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

- **Sachin Kumar** - Backend & Database Architecture
- **Ashwani Mishra** - Frontend & UI Components  
- **Aditya Singh** - AI Integration & Voice Features


## 📝 License

This project is open source and available under the MIT License.

## 📞 Support & Contact

For issues, feature requests, or contributions, please create an issue in the repository or contact the development team.

---

**Last Updated**: March 7, 2026  
**Status**: In Active Development
