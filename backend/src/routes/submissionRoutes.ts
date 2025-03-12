import express from 'express';
import { body } from 'express-validator';
import { 
  submitQuiz, 
  getQuizResults, 
  getMySubmissions 
} from '../controllers/submissionController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// Submission validation
const submissionValidation = [
  body('answers')
    .isArray()
    .withMessage('Answers must be an array'),
  body('answers.*.questionId')
    .notEmpty()
    .withMessage('Question ID is required'),
  body('answers.*.selectedChoices')
    .isArray()
    .withMessage('Selected choices must be an array'),
  body('startedAt')
    .isISO8601()
    .withMessage('Start time must be a valid date')
];

// Protect all routes
router.use(protect as any);

// Get my submissions
router.get('/', getMySubmissions);

// Quiz submission routes (nested under quizzes)
router.post(
  '/:quizId/submit',
  authorize(UserRole.STUDENT) as any,
  submissionValidation,
  submitQuiz as any
);

// Get quiz results (teachers only)
router.get(
  '/:quizId/results',
  authorize(UserRole.TEACHER) as any,
  getQuizResults as any
);

export default router; 