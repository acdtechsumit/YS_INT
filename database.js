const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://acdtechsumit_db_user:Sumit%40MDB@cluster0.pyrgkg7.mongodb.net/YS_INTDB';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

const userSchema = new mongoose.Schema({
  Username: String,
  password: String,
}, { collection: 'Users' });

const User = mongoose.model('User', userSchema);

async function validateLogin(username, password) {
  try {
    const user = await User.findOne({
      Username: username,
      password: password
    });
    return user;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

module.exports = { connectDB, validateLogin };

