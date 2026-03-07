# EqualEd

EqualEd is an inclusive and highly accessible educational platform designed to empower students and provide teachers with intuitive management tools.

## 🚨 Problem Statement

EqualEd addresses the critical challenges in educational accessibility:

- **Physical Disabilities**: Students with mobility issues cannot easily navigate traditional websites and online learning platforms
- **Voice Control Limitations**: Lack of reliable voice command systems makes it difficult for physically disabled students to interact with content
- **Eye Tracking Absence**: Students unable to use a mouse or keyboard need alternative input methods like eye tracking
- **Hand Tracking Gap**: Hand gesture recognition features are missing for students who prefer gesture-based interaction
- **Language Barriers**: Limited support for multiple languages and dialects (e.g., Hindi/Hinglish) excludes bilingual learners
- **Teacher Management Issues**: Teachers lack tools to efficiently track individual student progress, identify learning gaps, and provide timely interventions
- **Personalization Deficit**: One-size-fits-all teaching approach doesn't account for diverse learning needs and paces
- **AI Integration Scarcity**: Limited use of AI-powered learning assistance for personalized tutoring and content generation
- **Accessibility Compliance**: Many platforms fail to meet WCAG accessibility standards and don't consider inclusive design
- **Real-time Monitoring**: Teachers cannot track student performance in real-time or adapt lessons based on live feedback

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

## 💡 Suggested Improvements

- **Real-time Notifications**: Add WebSocket support for instant notifications when teachers provide feedback or assign tasks
- **Progress Analytics**: Create detailed dashboard with charts and graphs showing student learning trends
- **Offline Mode**: Enable offline lesson access with sync when connection restores
- **Mobile App**: Develop native mobile apps (iOS/Android) for better accessibility on smartphones
- **Content Library**: Build a public repository of pre-made lessons and quizzes for teachers to reuse
- **Gamification**: Add points, badges, and leaderboards to increase student engagement
- **Video Lessons**: Support video upload and streaming for multimedia learning experiences
- **Better Error Handling**: Implement comprehensive error logging and user-friendly error messages across the app
- **API Documentation**: Generate interactive API docs using Swagger/OpenAPI
- **Testing Coverage**: Add unit tests and integration tests for critical features
- **Performance Optimization**: Implement caching strategies and database query optimization
- **Accessibility Audit**: Conduct WCAG compliance audit and fix accessibility issues
- **Rate Limiting**: Add API rate limiting to prevent abuse
- **Export Features**: Allow teachers to export progress reports as PDF

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
- [Add your name here]

## 📝 License

This project is open source and available under the MIT License.

## 📞 Support & Contact

For issues, feature requests, or contributions, please create an issue in the repository or contact the development team.

---

**Last Updated**: March 7, 2026  
**Status**: In Active Development
