import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`MongoDB connection attempt ${i + 1} of ${retries}`);
      const conn = await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      console.log('Database name:', conn.connection.name);
      return;
    } catch (error) {
      console.error(`Connection attempt ${i + 1} failed:`, error);
      if (i === retries - 1) {
        console.error('Max retries reached. Exiting...');
        process.exit(1);
      }
      console.log(`Retrying in ${delay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const connectDB = async () => {
  try {
    await connectWithRetry();

    // Handle connection errors after initial connection
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      connectWithRetry();
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error in database connection:', error);
    process.exit(1);
  }
};

export default connectDB; 