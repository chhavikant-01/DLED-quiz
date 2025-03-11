import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IQuiz } from './Quiz';
import { IQuestion } from './Question';

interface Answer {
  questionId: IQuestion['_id'];
  selectedChoices: number[]; // Indexes of the selected choices
}

export interface ISubmission extends Document {
  quizId: IQuiz['_id'];
  userId: IUser['_id'];
  answers: Answer[];
  score: number;
  maxScore: number;
  submittedAt: Date;
  startedAt: Date;
  completionTime: number; // in seconds
}

const AnswerSchema = new Schema({
  questionId: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: [true, 'Answer must reference a question']
  },
  selectedChoices: {
    type: [Number],
    required: [true, 'Selected choices are required']
  }
});

const SubmissionSchema = new Schema<ISubmission>({
  quizId: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Submission must belong to a quiz']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Submission must have a user']
  },
  answers: {
    type: [AnswerSchema],
    default: []
  },
  score: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    required: [true, 'Maximum score is required']
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date,
    required: [true, 'Start time is required']
  },
  completionTime: {
    type: Number,
    required: [true, 'Completion time is required']
  }
});

// Compound index to ensure a user can only submit once per quiz
SubmissionSchema.index({ quizId: 1, userId: 1 }, { unique: true });

export default mongoose.model<ISubmission>('Submission', SubmissionSchema); 