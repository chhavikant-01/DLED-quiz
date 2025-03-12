# DLED Quiz Application

A full-stack quiz application for teachers and students with modern security features, user authentication, and role-based access control.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization**
  - Role-based access control (Teacher, Student, Admin)
  - JWT token authentication with refresh token mechanism
  - Secure password hashing using bcrypt
- **Quiz Management**
  - Create, read, update, and delete quizzes
  - Add questions with multiple choice options
  - Publish/unpublish quizzes for students
- **Quiz Taking (todo)**
  - User-friendly quiz interface
  - Automatic scoring and feedback
  - Progress tracking and history
- **Responsive Design**
  - Modern UI built with React and TailwindCSS
  - Mobile-first approach for all devices

### Security Features
- **JWT Authentication**
  - Short-lived access tokens (7 days default)
  - Long-lived refresh tokens (30 days default)
  - Automatic token refresh on expiration
- **HTTP-Only Cookies**
  - Secure, HTTP-only cookies for token storage
  - Path-limited cookies for refresh tokens
- **Token Validation**
  - Server-side refresh token storage and validation
  - Token expiration detection and handling
- **Protection Against Common Attacks**
  - CORS protection
  - Helmet security headers
  - Input validation with Express Validator

## 🛠️ Tech Stack

### Backend
- **Node.js & Express**: Fast, unopinionated web framework
- **TypeScript**: Type-safe JavaScript
- **MongoDB & Mongoose**: NoSQL database and ODM
- **JWT**: JSON Web Tokens for authentication
- **Winston**: Logging library
- **Express Validator**: Input validation middleware

### Frontend
- **React 19**: Modern UI library with hooks
- **TypeScript**: Type safety for components
- **Vite**: Next-generation frontend build tool
- **React Router**: Client-side routing
- **React Query**: Data fetching and caching
- **Zustand**: Simple state management
- **TailwindCSS**: Utility-first CSS framework
- **Axios**: HTTP client with interceptors for token refresh

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/chhavikant-01/DLED-quiz.git
cd DLED-quiz
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Configure backend environment
```bash
cp .env.example .env
# Edit .env with your MongoDB connection string and JWT secrets
```

4. Install frontend dependencies
```bash
cd ../frontend
npm install
```

5. Configure frontend environment
```bash
cp .env.example .env.local
# Edit .env.local with your API URL if needed
```

### Running the Application

#### Development Mode

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. In a separate terminal, start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5050/api

#### Production Mode

1. Build the backend:
```bash
cd backend
npm run build
npm start
```

2. Build the frontend:
```bash
cd frontend
npm run build
# Deploy the contents of dist directory
```

### Database Seeding
To populate the database with sample data:
```bash
cd backend
npm run seed
```

## 📦 Dependencies & Their Purpose

### Backend Dependencies

- **bcrypt**: Secure password hashing
- **cookie-parser**: Parse HTTP cookies
- **cors**: Enable CORS for API access
- **dotenv**: Environment variable management
- **express**: Web framework
- **express-validator**: Input validation
- **helmet**: Security headers
- **jsonwebtoken**: JWT implementation
- **mongoose**: MongoDB object modeling
- **morgan**: HTTP request logger
- **winston**: Application logging

### Frontend Dependencies

- **@tanstack/react-query**: Data fetching and caching
- **axios**: HTTP client with interceptors
- **react**: UI library
- **react-hook-form**: Form validation and handling
- **react-router-dom**: Client-side routing
- **zod**: Schema validation
- **zustand**: State management
- **tailwindcss**: Utility-first CSS framework

## 🔒 Security Implementation Details

### Access Token Flow
1. User logs in with credentials
2. Server validates credentials and issues access token and refresh token
3. Access token used for API authorization (expires in 7 days)
4. HTTP-only cookies store tokens securely

### Refresh Token Mechanism
1. When an access token expires, the client attempts to use the refresh token
2. Server validates the refresh token against the database
3. If valid, a new access token is issued
4. If invalid, the user is forced to log in again

### Token Security Measures
- Refresh tokens stored in database for validation
- Path-limited cookies to prevent token theft
- Automatic renewal of access tokens
- Proper error handling for expired tokens

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token

### Quizzes
- `POST /api/quizzes` - Create a new quiz (Teacher only)
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get a single quiz
- `PUT /api/quizzes/:id` - Update a quiz (Teacher only)
- `DELETE /api/quizzes/:id` - Delete a quiz (Teacher only)
- `PUT /api/quizzes/:id/publish` - Publish a quiz (Teacher only)

### Questions
- `POST /api/quizzes/:quizId/questions` - Add a question to a quiz (Teacher only)
- `GET /api/quizzes/:quizId/questions` - Get all questions for a quiz
- `GET /api/questions/:id` - Get a single question
- `PUT /api/questions/:id` - Update a question (Teacher only)
- `DELETE /api/questions/:id` - Delete a question (Teacher only)

## 📄 License

This project is licensed under the MIT License.