import * as express from 'express';
import { body } from 'express-validator';
import { 
  getQuestion, 
  updateQuestion, 
  deleteQuestion 
} from '../controllers/questionController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// Question validation
const questionValidation = [
  body('questionText')
    .notEmpty()
    .withMessage('Question text is required')
    .trim(),
  body('choices')
    .isArray({ min: 2 })
    .withMessage('Question must have at least 2 choices'),
  body('choices.*.text')
    .notEmpty()
    .withMessage('Choice text is required')
    .trim(),
  body('choices.*.isCorrect')
    .isBoolean()
    .withMessage('isCorrect must be a boolean'),
  body('isMultipleChoice')
    .optional()
    .isBoolean()
    .withMessage('isMultipleChoice must be a boolean'),
  body('points')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Points must be between 1 and 10')
];

// Protect all routes
router.use(protect as any);

// Question routes
router.route('/:id')
  .get(getQuestion as any)
  .put(authorize(UserRole.TEACHER) as any, questionValidation, updateQuestion as any)
  .delete(authorize(UserRole.TEACHER) as any, deleteQuestion as any);

export default router; 