import { Request, Response, NextFunction } from 'express';
import Quiz, { IQuiz } from '../models/Quiz';
import Question from '../models/Question';
import { UserRole } from '../models/User';
import mongoose from 'mongoose';

//POST /api/quizzes
export const createQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, timeLimit } = req.body;

    const quiz = await Quiz.create({
      title,
      description,
      timeLimit,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

//GET /api/quizzes
export const getQuizzes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let query;
    
    // If teacher, only show their quizzes
    if (req.user.role === UserRole.TEACHER) {
      query = Quiz.find({ createdBy: req.user._id });
    } else {
      query = Quiz.find({});
    }

    const quizzes = await query;

    const quizzesData = quizzes.map((quiz) => ({
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      status: quiz.isPublished ? 'published' : 'draft',
      createdBy: quiz.createdBy,
      updatedAt: quiz.updatedAt,
    }));

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzesData,
    });
  } catch (error) {
    next(error);
  }
};

//GET /api/quizzes/:id
export const getQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const q = await Quiz.findById(req.params.id);

    if (!q) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Check if user owns the quiz
    if (
      req.user.role === UserRole.TEACHER && 
      (q as any).createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this quiz',
      });
    }

    // Populate questions
    const questions = await Question.find({ quizId: q._id });
    const questionsData = questions.map((question) => ({
      _id: question._id,
      quizId: question.quizId,
      text: question.questionText,
      options: question.choices,
      correctAnswer: question.points,
      isMultipleChoice: question.isMultipleChoice,
    }));
    
    const quiz = {
      _id: q._id,
      title: q.title,
      description: q.description,
      timeLimit: q.timeLimit,
      isPublished: q.isPublished,
      createdBy: q.createdBy,
      questions: questionsData,
    };

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

//PUT /api/quizzes/:id
export const updateQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let quiz = await Quiz.findById(req.params.id);

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
        message: 'Not authorized to update this quiz',
      });
    }

    quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

//DELETE /api/quizzes/:id
export const deleteQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

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
        message: 'Not authorized to delete this quiz',
      });
    }

    // Start a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete all questions associated with the quiz
      await Question.deleteMany({ quizId: quiz._id }).session(session);
      
      // Delete the quiz
      await Quiz.findByIdAndDelete(req.params.id).session(session);
      
      // Commit the transaction
      await session.commitTransaction();
      
      res.status(200).json({
        success: true,
        data: {},
      });
    } catch (error) {
      // Abort the transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      // End the session
      session.endSession();
    }
  } catch (error) {
    next(error);
  }
};

//PUT /api/quizzes/:id/publish
export const publishQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let quiz = await Quiz.findById(req.params.id);

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
        message: 'Not authorized to publish this quiz',
      });
    }

    // Check if the quiz has questions
    const questions = await Question.find({ quizId: quiz._id });
    
    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot publish a quiz without questions',
      });
    }

    quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { isPublished: true },
      {
        new: true,
        runValidators: false,
      }
    );

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
}; 