import express from 'express';
import { register, login, logout } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { body } from 'express-validator';

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Please include a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please include a valid email')
    .normalizeEmail(),
  body('password')
    .exists()
    .withMessage('Password is required'),
];

// Routes
router.post('/register', registerValidation, register as express.RequestHandler);
router.post('/login', loginValidation, login as express.RequestHandler);
router.get('/logout', protect as express.RequestHandler, logout as express.RequestHandler);

export default router; 