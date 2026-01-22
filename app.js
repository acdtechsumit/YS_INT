const http = require('http');
const fs = require('fs');
const querystring = require('querystring');
const chalk = require('chalk');
const { connectDB, validateLogin, createSignup, Checkmail, createforgotOTP, createsignOTP, verifysignOTP, verifyforgotOTP, updatePassword } = require('./database');

connectDB();

http.createServer(async (req, resp) => {

   if (req.url === '/') {
      fs.readFile('login.html', (err, login) => {
         if (err) {
            resp.writeHead(404, { 'Content-Type': 'text/html' });
            return resp.end('Login page not found');
         }
         resp.end(login);
      });
   }


   else if (req.url === '/dashboard' && req.method === 'POST') {
      let logindata = [];

      req.on('data', chunk => {
         logindata.push(chunk);
      });

      req.on('end', async () => {
         let loginrawdata = Buffer.concat(logindata).toString();
         let loginreadabledata = querystring.parse(loginrawdata);

         try {
            const user = await validateLogin(loginreadabledata.Username, loginreadabledata.password);

            if (user) {
               console.log('Login successful for user:', loginreadabledata.Username, 'with password:', loginreadabledata.password);
               fs.readFile('dashboard.html', (err, dashboard) => {
                  if (err) {
                     resp.writeHead(404, { 'Content-Type': 'text/html' });
                     return resp.end('404 Not Found');
                  }

                  let dashboardContent = dashboard.toString();
                  dashboardContent = dashboardContent.replace('{{username}}', loginreadabledata.Username);

                  resp.writeHead(200, { 'Content-Type': 'text/html' });
                  resp.end(dashboardContent);
               });
            }
            else {
               fs.readFile('login.html', (err, login) => {
                  if (err) {
                     resp.writeHead(404, { 'Content-Type': 'text/html' });
                     return resp.end('404 Not Found');
                  }
                  resp.writeHead(200, { 'Content-Type': 'text/html' });
                  resp.write('<script>alert("Invalid credentials, please try again.");window.location.href = "/";</script>');
                  resp.end(login);
               });
            }
         } catch (error) {
            console.error('Login error:', error);
            resp.writeHead(500, { 'Content-Type': 'text/html' });
            resp.end('Server error');
         }
      });
   }
   else if (req.url === '/forgotpassword') {
      fs.readFile('forgotpassword.html', (err, forgotpassword) => {
         if (err) {
            resp.writeHead(404, { 'Content-Type': 'text/html' });
            return resp.end('Forgot Password page not found');
         }
         resp.writeHead(200, { 'Content-Type': 'text/html' });
         resp.end(forgotpassword);
      });

   }

   else if (req.url === '/signup' && req.method === 'GET') {
      fs.readFile('signup.html', (err, signup) => {
         if (err) {
            resp.writeHead(404, { 'Content-Type': 'text/html' });
            return resp.end('Forgot Password page not found');
         }
         resp.writeHead(200, { 'Content-Type': 'text/html' });
         resp.end(signup);
      });

   }

   else if (req.url === '/signupcode' && req.method === 'POST') {
      let signupdata = [];

      req.on('data', chunk => {
         signupdata.push(chunk);
      });

      req.on('end', async () => {
         let signuprawdata = Buffer.concat(signupdata).toString();
         let signupreadabledata = querystring.parse(signuprawdata);
         try {
            const email = await Checkmail(signupreadabledata.email);
            if (email) {
               fs.readFile('login.html', (err, login) => {
                  if (err) {
                     resp.writeHead(404, { 'Content-Type': 'text/html' });
                     return resp.end('404 Not Found');
                  }
                  resp.writeHead(200, { 'Content-Type': 'text/html' });
                  resp.write('<script>alert ("email already exist");</script>')
                  resp.end(login);
               });
            }
            else {
               fs.readFile('signupcode.html', (err, signupcode) => {
                  if (err) {
                     resp.writeHead(404, { 'Content-Type': 'text/html' });
                     return resp.end('404 Not Found');
                  }
                  resp.writeHead(200, { 'Content-Type': 'text/html' });
                  createsignOTP(signupreadabledata.email);
                  let signupcodeContent = signupcode.toString();
                  signupcodeContent = signupcodeContent.replace('{{email}}', signupreadabledata.email);
                  signupcodeContent = signupcodeContent.replace('{{password}}', signupreadabledata.confirmPassword);
                  console.log("this is from cnf psw", signupreadabledata.confirmPassword);
                  resp.end(signupcodeContent);

               });
            }
         } catch (error) {
            console.error('signup error:', error);
            resp.writeHead(500, { 'Content-Type': 'text/html' });
            resp.end('Server error');
         }
      });
   }


   else if (req.url === '/signupuser' && req.method === 'POST') {
      let signotpdata = [];
      req.on('data', chunk => {
         signotpdata.push(chunk);
      });

      req.on('end', async () => {
         let signotprawdata = Buffer.concat(signotpdata).toString();
         let signotpreadabledata = querystring.parse(signotprawdata);

         try {
            const otprecord = await verifysignOTP(signotpreadabledata.email, signotpreadabledata.otp)
            if (otprecord) {
               const result = await createSignup(signotpreadabledata.email, signotpreadabledata.password);
               if (result) {
                  console.log('Account created successfully for email:', signotpreadabledata.email, 'with password:', signotpreadabledata.password);
                  resp.writeHead(200, { 'Content-Type': 'text/html' });
                  resp.end('<script>alert("Account Created Successfully");window.location.href = "/";</script>');
               }
               else {
                  resp.writeHead(500, { 'Content-Type': 'text/html' });
                  resp.end('<script>alert("some error occured");window.location.href = "/";</script>');
               }
            }
            else {
               fs.readFile('signupcode.html', (err, signupcode) => {
                  if (err) {
                     resp.writeHead(404, { 'Content-Type': 'text/html' });
                     return resp.end('404 Not Found');
                  }
                  resp.writeHead(200, { 'Content-Type': 'text/html' });
                  resp.write('<script>alert("invalid OTP");</script>')
                  let signupcodeContent = signupcode.toString();
                  signupcodeContent = signupcodeContent.replace('{{email}}', signotpreadabledata.email);
                  signupcodeContent = signupcodeContent.replace('{{password}}', signotpreadabledata.password);
                  resp.end(signupcodeContent);
               });
            }
         }
         catch (error) {
            console.error('signup error:', error);
            resp.writeHead(500, { 'Content-Type': 'text/html' });
            resp.end('Server error');
         }

      });
   }


   else if (req.url === '/forgotpassword' && req.method === 'GET ') {
      fs.readFile('forgotpassword.html', (err, forgotpassword) => {
         if (err) {
            resp.writeHead(404, { 'Content-Type': 'text/html' });
            return resp.end('Forgot Password page not found');
         }
         resp.writeHead(200, { 'Content-Type': 'text/html' });
         resp.end(forgotpassword);
      });
   }

   else if (req.url === '/forgotcode' && req.method === 'GET') {
      fs.readFile('forgotcode.html', (err, forgotcode) => {
         if (err) {
            resp.writeHead(404, { 'Content-Type': 'text/html' });
            return resp.end('Forgot Code page not found');
         }
         resp.writeHead(200, { 'Content-Type': 'text/html' });
         resp.end(forgotcode);
      });
   }

   else if (req.url === '/forgotcode' && req.method === 'POST') {
      let forgotdata = [];
      req.on('data', chunk => {
         forgotdata.push(chunk);
      });

      req.on('end', async () => {
         let forgotrawdata = Buffer.concat(forgotdata).toString();
         let forgotreadabledata = querystring.parse(forgotrawdata);

         global.forgottenEmail = forgotreadabledata.email;

         try {
            const email = await Checkmail(forgotreadabledata.email);
            if (email) {
               createforgotOTP(forgotreadabledata.email);
               fs.readFile('forgotcode.html', (err, forgotcode) => {
                  if (err) {
                     resp.writeHead(404, { 'Content-Type': 'text/html' });
                     return resp.end('404 Not Found');
                  }
                  resp.writeHead(200, { 'Content-Type': 'text/html' });
                  resp.end(forgotcode);
               });
            }
            else {
               fs.readFile('forgotpassword.html', (err, forgotpassword) => {
                  if (err) {
                     resp.writeHead(404, { 'Content-Type': 'text/html' });
                     return resp.end('404 Not Found');
                  }
                  resp.writeHead(200, { 'Content-Type': 'text/html' });
                  resp.write('<script>alert("Email not found, please try again.");window.location.href = "/forgotpassword";</script>');
                  resp.end(forgotpassword);
               });
            }
         } catch (error) {
            console.error('Forgot Password error:', error);
            resp.writeHead(500, { 'Content-Type': 'text/html' });
            resp.end('Server error');
         }
      });
   }

   else if (req.url === '/resetpassword' && req.method === 'POST') {
      let otpdata = [];
      req.on('data', chunk => {
         otpdata.push(chunk);
      });

      req.on('end', async () => {
         let otprawdata = Buffer.concat(otpdata).toString();
         let otpreadabledata = querystring.parse(otprawdata);

         try {
            const otpRecord = await verifyforgotOTP(forgottenEmail, otpreadabledata.otp);
            if (otpRecord) {
               fs.readFile('resetpassword.html', (err, resetpassword) => {
                  if (err) {
                     resp.writeHead(404, { 'Content-Type': 'text/html' });
                     return resp.end('404 Not Found');
                  }
                  resp.writeHead(200, { 'Content-Type': 'text/html' });
                  resp.end(resetpassword);
               });
            } else {
               console.log(chalk.red('Entered OTP:', otpreadabledata.otp, 'for Email:', forgottenEmail, 'is invalid'));
               fs.readFile('forgotcode.html', (err, forgotcode) => {
                  if (err) {
                     resp.writeHead(404, { 'Content-Type': 'text/html' });
                     return resp.end('404 Not Found');
                  }
                  resp.writeHead(200, { 'Content-Type': 'text/html' });
                  resp.write('<script>alert("Invalid OTP");window.location.href = "/forgotcode";</script>');
                  resp.end(forgotcode);
               });
            }
         } catch (error) {
            console.error('Verify OTP error:', error);
            resp.writeHead(500, { 'Content-Type': 'text/html' });
            resp.end('Server error');
         }
      });
   }

   else if (req.url === '/updatepassword' && req.method === 'POST') {
      let resetdata = [];
      req.on('data', chunk => {
         resetdata.push(chunk);
      });
      req.on('end', async () => {
         let resetrawdata = Buffer.concat(resetdata).toString();
         let resetreadabledata = querystring.parse(resetrawdata);
         console.log('New Password:', resetreadabledata.password, 'for Email:', forgottenEmail);
         try {
            const result = await updatePassword(forgottenEmail, resetreadabledata.password);
            if (result.modifiedCount > 0) {
               resp.writeHead(200, { 'Content-Type': 'text/html' });
               resp.end('<script>alert("Password updated successfully");window.location.href = "/";</script>');
            }
            else if (result.matchedCount > 0) {
               resp.writeHead(200, { 'Content-Type': 'text/html' });
               resp.end('<script>alert("New password is the same as the old password");window.location.href = "/resetpassword";</script>');
            }
            else {
               resp.writeHead(500, { 'Content-Type': 'text/html' });
               resp.end('<script>alert("Error updating password");</script>');
            }
         } catch (error) {
            console.error('Update Password error:', error);
            resp.writeHead(500, { 'Content-Type': 'text/html' });
            resp.end('Server error');
         }
      });
   }
   else {
      resp.writeHead(404, { 'Content-Type': 'text/html' });
      resp.end('404 Not Found');
   }

}).listen(3000);