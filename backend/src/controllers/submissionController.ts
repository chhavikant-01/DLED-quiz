import { Request, Response, NextFunction } from 'express';
import Submission from '../models/Submission';
import Quiz from '../models/Quiz';
import Question from '../models/Question';
import { UserRole } from '../models/User';

//POST /api/quizzes/:quizId/submit
export const submitQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { quizId } = req.params;
    const { answers, startedAt } = req.body;

    // Check if quiz exists and is published
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    if (!quiz.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'This quiz is not published yet',
      });
    }

    // Check if user has already submitted this quiz
    const existingSubmission = await Submission.findOne({
      quizId,
      userId: req.user._id,
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this quiz',
      });
    }

    // Get all questions for this quiz
    const questions = await Question.find({ quizId });

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'This quiz has no questions',
      });
    }

    // Calculate max score
    const maxScore = questions.reduce((total, question) => total + question.points, 0);

    // Calculate score
    let score = 0;
    for (const answer of answers) {
      const question = questions.find(q => (q as any)._id.toString() === answer.questionId);
      
      if (!question) continue;

      // Get correct choices
      const correctChoiceIndexes = question.choices
        .map((choice, index) => choice.isCorrect ? index : -1)
        .filter(index => index !== -1);

      // Check if answer is correct
      const isCorrect = question.isMultipleChoice
        ? JSON.stringify(answer.selectedChoices.sort()) === JSON.stringify(correctChoiceIndexes.sort())
        : answer.selectedChoices.length === 1 && correctChoiceIndexes.includes(answer.selectedChoices[0]);

      if (isCorrect) {
        score += question.points;
      }
    }

    // Calculate completion time in seconds
    const submittedAt = new Date();
    const startTime = new Date(startedAt);
    const completionTime = Math.floor((submittedAt.getTime() - startTime.getTime()) / 1000);

    // Create submission
    const submission = await Submission.create({
      quizId,
      userId: req.user._id,
      answers,
      score,
      maxScore,
      startedAt: startTime,
      submittedAt,
      completionTime,
    });

    res.status(201).json({
      success: true,
      data: {
        submission,
        score,
        maxScore,
        percentage: Math.round((score / maxScore) * 100),
      },
    });
  } catch (error) {
    next(error);
  }
};

//GET /api/quizzes/:quizId/results
export const getQuizResults = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { quizId } = req.params;

    // Check if quiz exists and belongs to the teacher
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Only the teacher who created the quiz can see results
    if (
      req.user.role === UserRole.TEACHER &&
      (quiz as any).createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these results',
      });
    }

    // Get all submissions for this quiz
    const submissions = await Submission.find({ quizId }).populate('userId', 'name email');

    // Calculate statistics
    const totalSubmissions = submissions.length;
    const averageScore = totalSubmissions > 0
      ? submissions.reduce((sum, sub) => sum + sub.score, 0) / totalSubmissions
      : 0;
    const highestScore = totalSubmissions > 0
      ? Math.max(...submissions.map(sub => sub.score))
      : 0;
    const lowestScore = totalSubmissions > 0
      ? Math.min(...submissions.map(sub => sub.score))
      : 0;
    const averageCompletionTime = totalSubmissions > 0
      ? submissions.reduce((sum, sub) => sum + sub.completionTime, 0) / totalSubmissions
      : 0;

    res.status(200).json({
      success: true,
      data: {
        submissions,
        stats: {
          totalSubmissions,
          averageScore,
          highestScore,
          lowestScore,
          averageCompletionTime,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

//GET /api/submissions
export const getMySubmissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const submissions = await Submission.find({ userId: req.user._id })
      .populate('quizId', 'title description');

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
}; 