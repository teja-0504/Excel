import mongoose from 'mongoose';

const uri = 'mongodb+srv://TEJA:teja5504@cluster0.6sarn3h.mongodb.net/data?retryWrites=true&w=majority';

console.log('Testing MongoDB connection...');

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4
})
.then(() => {
  console.log('✅ MongoDB connection successful!');
  mongoose.connection.close();
  process.exit(0);
})
.catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});

// Add timeout to prevent hanging
setTimeout(() => {
  console.error('❌ Connection test timed out');
  process.exit(1);
}, 15000);
