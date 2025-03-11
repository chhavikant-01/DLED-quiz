import mongoose from 'mongoose';
import User, { UserRole } from '../models/User';
import Quiz from '../models/Quiz';
import Question from '../models/Question';
import logger from '../config/logger';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = ""; // add your own mongoURI
    
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    
    await mongoose.connect(mongoURI);
    
    logger.info('MongoDB Connected');
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error connecting to MongoDB: ${error.message}`);
    } else {
      logger.error('Unknown error connecting to MongoDB');
    }
    
    process.exit(1);
  }
};

// Clear database
const clearDB = async () => {

    try {
      await User.deleteMany({});
      await Quiz.deleteMany({});
      await Question.deleteMany({});
      
      logger.info('Database cleared');
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error clearing database: ${error.message}`);
      } else {
        logger.error('Unknown error clearing database');
      }
      
      process.exit(1);
    }
};

// Seed users
const seedUsers = async () => {
  try {
    const teacherUser = await User.create({
      name: 'Teacher User',
      email: 'teacher@example.com',
      password: 'password123',
      role: UserRole.TEACHER,
    });

    const studentUser = await User.create({
      name: 'Student User',
      email: 'student@example.com',
      password: 'password123',
      role: UserRole.STUDENT,
    });

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: UserRole.ADMIN,
    });

    logger.info('Users seeded');
    
    return { teacherUser, studentUser, adminUser };
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error seeding users: ${error.message}`);
    } else {
      logger.error('Unknown error seeding users');
    }
    
    process.exit(1);
  }
};

// Seed quizzes and questions
const seedQuizzes = async (teacherId: mongoose.Types.ObjectId) => {
  try {
    // Create a quiz
    const quiz = await Quiz.create({
      title: 'Sample Quiz',
      description: 'This is a sample quiz for testing purposes',
      createdBy: teacherId,
      isPublished: true,
      timeLimit: 30, // 30 minutes
    });

    // Create questions for the quiz
    await Question.create({
      quizId: quiz._id,
      questionText: 'What is the capital of France?',
      choices: [
        { text: 'London', isCorrect: false },
        { text: 'Paris', isCorrect: true },
        { text: 'Berlin', isCorrect: false },
        { text: 'Madrid', isCorrect: false },
      ],
      isMultipleChoice: false,
      points: 1,
    });

    await Question.create({
      quizId: quiz._id,
      questionText: 'Which of the following are programming languages?',
      choices: [
        { text: 'JavaScript', isCorrect: true },
        { text: 'HTML', isCorrect: false },
        { text: 'Python', isCorrect: true },
        { text: 'CSS', isCorrect: false },
      ],
      isMultipleChoice: true,
      points: 2,
    });

    await Question.create({
      quizId: quiz._id,
      questionText: 'What is 2 + 2?',
      choices: [
        { text: '3', isCorrect: false },
        { text: '4', isCorrect: true },
        { text: '5', isCorrect: false },
        { text: '22', isCorrect: false },
      ],
      isMultipleChoice: false,
      points: 1,
    });

    logger.info('Quizzes and questions seeded');
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error seeding quizzes: ${error.message}`);
    } else {
      logger.error('Unknown error seeding quizzes');
    }
    
    process.exit(1);
  }
};

// Run seed
const runSeed = async () => {
  try {
    await connectDB();
    await clearDB();
    const { teacherUser } = await seedUsers() as { teacherUser: any };
    await seedQuizzes(teacherUser._id);
    
    logger.info('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error running seed: ${error.message}`);
    } else {
      logger.error('Unknown error running seed');
    }
    
    process.exit(1);
  }
};

runSeed(); 