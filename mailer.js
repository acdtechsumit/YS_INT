const nodemailer = require("nodemailer");

async function sendforgotcodeMail(email, otp) {
  
  let transporter = nodemailer.createTransport({
    host: "mail.omshivlogistics.com", 
    port: 465,                        
    secure: true,                     
    auth: {
      user: "test@omshivlogistics.com", 
      pass: "_kN-T;CK!.sOS3#@",    
    },
  });

  try {

    let info = await transporter.sendMail({
      from: '"YS_INT APP" <test@omshivlogistics.com>', 
      to: email,                           
      subject: "OTP for Resetting Password",                    
      text: `Your OTP is ${otp}`, 
      html: `<b>Hello! Forgot your Password ? </b><p style="font-family: Arial, sans-serif; font-weight: bold;">Your OTP is ${otp}<br>you OTP will expire in 5 minutes</p>`, 
    });

    console.log("Message sent: %s", info.response);
  } catch (error) {
    console.error("Error occurred: ", error);
  }
}

async function sendsignupcodeMail(email, otp) {
  
  let transporter = nodemailer.createTransport({
    host: "mail.omshivlogistics.com", 
    port: 465,                        
    secure: true,                     
    auth: {
      user: "test@omshivlogistics.com", 
      pass: "_kN-T;CK!.sOS3#@",    
    },
  });

  try {

    let info = await transporter.sendMail({
      from: '"YS_INT APP" <test@omshivlogistics.com>', 
      to: email,                           
      subject: "OTP for Signup Verification",                    
      text: `Your OTP is ${otp}`, 
      html: `<b>Hello! New User</b><p style="font-family: Arial, sans-serif; font-weight: bold;">Your OTP is ${otp}<br>you OTP will expire in 5 minutes</p>`, 
    });

    console.log("Message sent: %s", info.response);
  } catch (error) {
    console.error("Error occurred: ", error);
  }
}

module.exports = { sendforgotcodeMail, sendsignupcodeMail };
