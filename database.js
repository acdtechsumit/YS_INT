const mongoose = require('mongoose');
const chalk = require('chalk');
const { sendforgotcodeMail, sendsignupcodeMail } = require('./mailer');

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

const User = mongoose.model('User', UsersSchema);

const forgototpschema = new mongoose.Schema({
  email: String,
  otp: String,
  createdAt: { type: Date, default: Date.now, index: { expires: 300 } }
}, { collection: 'forgotOTPs' });

const forgotOTPModel = mongoose.model('forgotOTP', forgototpschema);

const signupotpschema = new mongoose.Schema({
  email: String,
  otp: String,
  createdAt: { type: Date, default: Date.now, index: { expires: 300 } }
}, { collection: 'signupOTPs' });

const signupOTPModel = mongoose.model('signupOTP', signupotpschema);

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

async function createsignOTP(email) {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    function savesignOTP(email, otp) {

      const otpEntry = new signupOTPModel({ email: email, otp: otp, createdAt: new Date() });
      return otpEntry.save();
    }
    savesignOTP(email, otp);
    sendsignupcodeMail(email, otp);
    console.log(chalk.green('generated SignUp OTP:', otp, 'for Email:', email));
  } catch (error) {
    console.error('Create OTP error:', error);
    throw error;
  }
}

async function createSignup(email, password) {
  try {
    const newUser = new User({
      email: email,
      password: password
    });
    const result = await newUser.save();
    return result;
  } catch (error) {
    console.error('Create Signup error:', error);
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

async function verifysignOTP(email, otp) {
  try {
    return signupOTPModel.findOne({ email: email, otp: otp });
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw error;
  }
}

function createforgotOTP(email) {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    function saveforgotOTP(email, otp) {

      const otpEntry = new forgotOTPModel({ email: email, otp: otp, createdAt: new Date() });
      return otpEntry.save();
    }
    saveforgotOTP(email, otp);
    sendforgotcodeMail(email, otp);
    console.log(chalk.green('generated Forgot OTP:', otp, 'for Email:', email));
  } catch (error) {
    console.error('Create OTP error:', error);
    throw error;
  }
}


async function verifyforgotOTP(email, otp) {
  try {
    return forgotOTPModel.findOne({ email: email, otp: otp });
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

module.exports = { connectDB, validateLogin, createSignup, Checkmail, verifyforgotOTP, verifysignOTP, createsignOTP, createforgotOTP, updatePassword };