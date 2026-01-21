const mongoose = require('mongoose');
const chalk = require('chalk');

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

const UsersSchema = new mongoose.Schema({
  email: String,
  password: String,
}, { collection: 'Users' });

const OTPSchema = new mongoose.Schema({
  email: String,
  otp: String,
  createdAt: { type: Date, default: Date.now, index: { expires: 300 } }
}, { collection: 'OTPs' });

const OTPModel = mongoose.model('OTP', OTPSchema);

const User = mongoose.model('User', UsersSchema);

async function validateLogin(username, password) {
  try {
    const user = await User.findOne({
      email: username,
      password: password
    });
    return user;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

async function createSignup(email, password) {
  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const newUser = new User({
      email: email,
      password: password
    });
    const result = await newUser.save();
    return result;
  } catch (error) {
    console.error('Signup database error:', error);
    throw error;
  }
}

async function Checkmail(email) {
  try {
    const user = await User.findOne({ email: email });
    return user;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

function createOTP(email) {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    function saveOTP(email, otp) {

      const otpEntry = new OTPModel({ email: email, otp: otp, createdAt: new Date() });
      return otpEntry.save();
    }
    saveOTP(email, otp);
    console.log(chalk.green('generated OTP:', otp, 'for Email:', email));
  } catch (error) {
    console.error('Create OTP error:', error);
    throw error;
  }
}


async function verifyOTP(email, otp) {
  try {
    return OTPModel.findOne({ email: email, otp: otp });
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw error;
  }
}

async function updatePassword(email, newPassword) {
  try {
    const result = await User.updateOne(
      { email: email },
      { $set: { password: newPassword } }
    );
    return result;
  } catch (error) {
    console.error('Update password error:', error);
    throw error;
  }
}

module.exports = { connectDB, validateLogin, createSignup, Checkmail, verifyOTP, createOTP, updatePassword };