# Quiz Application Backend

A RESTful API for a quiz application built with Node.js, Express, TypeScript, and MongoDB.

## Features

- User authentication with JWT
- Role-based access control (Teacher, Student, Admin)
- CRUD operations for quizzes and questions
- Quiz submission and scoring (todo)
- Quiz results and statistics (todo)

## Tech Stack

- Node.js
- Express
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Express Validator
- Winston Logger

## Getting Started

### Prerequisites

- Node.js 
- MongoDB 

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
5. Update the `.env` file with your configuration

### Running the Application

#### Development Mode
```
npm run dev
```

#### Production Mode
```
npm run build
npm start
```

### Seeding the Database
To populate the database with sample data:
```
npm run seed
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/logout` - Logout user

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

### Submissions (todo)
- `POST /api/quizzes/:quizId/submit` - Submit a quiz (Student only)
- `GET /api/quizzes/:quizId/results` - Get quiz results (Teacher only)
- `GET /api/submissions` - Get user's submissions

## License

This project is licensed under the MIT License. 