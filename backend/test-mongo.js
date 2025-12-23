import 'dotenv/config';
import mongoose from 'mongoose';

const testConnection = async () => {
  console.log('Testing MongoDB connection...');
  console.log('MONGODB_URI:', process.env.MONGODB_URI);
  
  // Test with different connection options
  const options = [
    {
      name: 'Standard connection',
      opts: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    },
    {
      name: 'IPv4 only',
      opts: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        family: 4
      }
    },
    {
      name: 'Direct connection',
      opts: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        directConnection: true
      }
    }
  ];

  for (const test of options) {
    try {
      console.log(`\n--- Testing ${test.name} ---`);
      await mongoose.connect(process.env.MONGODB_URI, test.opts);
      console.log('✅ Connection successful!');
      console.log('Database:', mongoose.connection.db.databaseName);
      await mongoose.disconnect();
      break;
    } catch (error) {
      console.log('❌ Connection failed:', error.message);
      try {
        await mongoose.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
    }
  }
};

testConnection().catch(console.error);