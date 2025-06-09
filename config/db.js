const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    // Validate MongoDB URI format
    if (!process.env.MONGO_URI.includes('mongodb.net/')) {
      throw new Error('MongoDB URI must include database name after mongodb.net/');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      },
      // Add connection timeout
      connectTimeoutMS: 10000,
      // Add retry options
      retryWrites: true,
      retryReads: true,
      // Add heartbeat frequency
      heartbeatFrequencyMS: 10000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    if (error.message.includes('Authentication failed')) {
      console.error('Authentication failed. Please check your MongoDB credentials.');
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.error('Could not resolve MongoDB host. Please check your network connection and MongoDB URI.');
    } else if (error.message.includes('MongoNetworkError')) {
      console.error('Network error connecting to MongoDB. Please check your network connection and MongoDB Atlas IP whitelist.');
    }
    process.exit(1);
  }
};

module.exports = connectDB; 