
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const mongoUri = 'mongodb+srv://TEJA:teja5504@cluster0.6sarn3h.mongodb.net/data?retryWrites=true&w=majority';

const users = [
  {
    username: 'adminuser',
    email: 'admin@example.com',
    password: 'admin123', // Will be hashed by pre-save hook
    role: 'admin',
    blocked: false,
  },
  {
    username: 'user1',
    email: 'user1@example.com',
    password: 'user123',
    role: 'user',
    blocked: false,
  },
  {
    username: 'user2',
    email: 'user2@example.com',
    password: 'user123',
    role: 'user',
    blocked: false,
  },
];

const seedUsers = async () => {
  try {
    console.log('Mongo URI:', mongoUri);
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');

    // Clear existing users
    await User.deleteMany({});
    console.log('Existing users removed');

    // Insert new users
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`User ${user.username} created`);
    }

    console.log('User seeding completed');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding users:', err);
    process.exit(1);
  }
};

seedUsers();
