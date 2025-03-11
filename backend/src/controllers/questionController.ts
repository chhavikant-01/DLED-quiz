import { Request, Response, NextFunction } from 'express';
import Question from '../models/Question';
import Quiz from '../models/Quiz';
import mongoose from 'mongoose';
import { IUser } from '../models/User';

// Define a custom request type that includes the user property
interface AuthRequest extends Request {
  user: {
    _id: mongoose.Types.ObjectId | string;
    [key: string]: any;
  };
}

//POST /api/quizzes/:quizId/questions
export const addQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { quizId } = req.params;
    const { 
      questionText, 
      choices, 
      isMultipleChoice = false,
      points = 1 
    } = req.body;

    // Check if quiz exists and belongs to the user
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Check if user owns the quiz
    if ((quiz as any).createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add questions to this quiz',
      });
    }

    // Create question
    const question = await Question.create({
      quizId,
      questionText,
      choices,
      isMultipleChoice,
      points
    });

    res.status(201).json({
      success: true,
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

//GET /api/quizzes/:quizId/questions
export const getQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { quizId } = req.params;

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Get questions
    const questions = await Question.find({ quizId });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

//GET /api/questions/:id
export const getQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    // Check if quiz exists and belongs to the user if teacher
    const quiz = await Quiz.findById(question.quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Associated quiz not found',
      });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

//PUT /api/questions/:id
export const updateQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    // Check if the associated quiz belongs to the user
    const quiz = await Quiz.findById(question.quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Associated quiz not found',
      });
    }

    // Check if user owns the quiz
    if ((quiz as any).createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this question',
      });
    }

    // If the quiz is published, don't allow updates
    if (quiz.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update questions in a published quiz',
      });
    }

    question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

//DELETE /api/questions/:id
export const deleteQuestion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    // Check if the associated quiz belongs to the user
    const quiz = await Quiz.findById(question.quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Associated quiz not found',
      });
    }

    // Check if user owns the quiz
    if ((quiz as any).createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this question',
      });
    }

    // If the quiz is published, don't allow deletion
    if (quiz.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete questions from a published quiz',
      });
    }

    await question.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
}; 