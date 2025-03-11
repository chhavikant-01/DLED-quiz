import mongoose, { Document, Schema } from 'mongoose';
import { IQuiz } from './Quiz';

export interface Choice {
  text: string;
  isCorrect: boolean;
}

export interface IQuestion extends Document {
  quizId: IQuiz['_id'];
  questionText: string;
  choices: Choice[];
  isMultipleChoice: boolean;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChoiceSchema = new Schema<Choice>({
  text: {
    type: String,
    required: [true, 'Choice text is required'],
    trim: true
  },
  isCorrect: {
    type: Boolean,
    required: true,
    default: false
  }
});

const QuestionSchema = new Schema<IQuestion>({
  quizId: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Question must belong to a quiz']
  },
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  choices: {
    type: [ChoiceSchema],
    validate: {
      validator: function(choices: Choice[]) {
        // Ensure at least 2 choices
        if (choices.length < 2) return false;
        
        // Ensure at least one correct choice
        return choices.some(choice => choice.isCorrect);
      },
      message: 'Question must have at least 2 choices and at least 1 correct choice'
    }
  },
  isMultipleChoice: {
    type: Boolean,
    default: false
  },
  points: {
    type: Number,
    default: 1,
    min: [1, 'Points cannot be less than 1'],
    max: [10, 'Points cannot be more than 10']
  }
}, {
  timestamps: true
});

// Pre-save hook to ensure multiple choice has more than one correct answer
QuestionSchema.pre('save', function(next) {
  const correctAnswers = this.choices.filter(choice => choice.isCorrect);
  
  // If not multiple choice, only one correct answer is allowed
  if (!this.isMultipleChoice && correctAnswers.length > 1) {
    this.choices.forEach((choice, index) => {
      if (choice.isCorrect && index > 0) {
        choice.isCorrect = false;
      }
    });
  }
  
  next();
});

export default mongoose.model<IQuestion>('Question', QuestionSchema); 