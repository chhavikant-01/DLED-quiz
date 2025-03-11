import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../config/logger';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI as string;
    
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    
    const conn = await mongoose.connect(mongoURI);
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error connecting to MongoDB: ${error.message}`);
    } else {
      logger.error('Unknown error connecting to MongoDB');
    }
    
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB; 