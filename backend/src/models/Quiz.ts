import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IQuiz extends Document {
  title: string;
  description: string;
  createdBy: IUser['_id'];
  isPublished: boolean;
  timeLimit: number | null; // in minutes, null means no time limit
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      maxlength: [100, 'Quiz title cannot be more than 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Quiz description cannot be more than 500 characters']
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Quiz must have a creator']
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    timeLimit: {
      type: Number,
      default: null,
      validate: {
        validator: function(value: number | null) {
          return value === null || (value > 0 && value <= 180);
        },
        message: 'Time limit must be between 1 and 180 minutes'
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for questions
QuizSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'quizId'
});

export default mongoose.model<IQuiz>('Quiz', QuizSchema); 