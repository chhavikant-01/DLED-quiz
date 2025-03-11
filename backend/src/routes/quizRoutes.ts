import express from 'express';
import { body } from 'express-validator';
import { 
  createQuiz, 
  getQuizzes, 
  getQuiz, 
  updateQuiz, 
  deleteQuiz,
  publishQuiz
} from '../controllers/quizController';
import { 
  addQuestion, 
  getQuestions 
} from '../controllers/questionController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// Quiz validation
const quizValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot be more than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('timeLimit')
    .optional()
    .isInt({ min: 1, max: 180 })
    .withMessage('Time limit must be between 1 and 180 minutes')
];

// Protect all routes
router.use(protect as any);

// Quiz routes
router.route('/')
  .post(authorize(UserRole.TEACHER) as any, quizValidation, createQuiz as any)
  .get(getQuizzes);

router.route('/:id')
  .get(getQuiz as any)
  .put(authorize(UserRole.TEACHER) as any, quizValidation, updateQuiz as any)
  .delete(authorize(UserRole.TEACHER) as any, deleteQuiz as any);

router.route('/:id/publish')
  .put(authorize(UserRole.TEACHER) as any, publishQuiz as any);

// Question routes (nested under quizzes)
router.route('/:quizId/questions')
  .post(authorize(UserRole.TEACHER) as any, addQuestion as any)
  .get(getQuestions as any);

export default router; 