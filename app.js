const http = require('http');
const fs = require('fs');
const querystring = require('querystring');
const { connectDB, validateLogin } = require('./database');

connectDB();

http.createServer((req, resp) => {

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
         let readabledata = querystring.parse(loginrawdata);

         console.log(readabledata);

         try {
            const user = await validateLogin(readabledata.Username, readabledata.password);

            if (user) {
               console.log('Authentication successful, loading dashboard');
               fs.readFile('dashboard.html', (err, dashboard) => {
                  if (err) {
                     resp.writeHead(404, { 'Content-Type': 'text/html' });
                     return resp.end('404 Not Found');
                  }
                  
                  let dashboardContent = dashboard.toString();
                  dashboardContent = dashboardContent.replace('{{username}}', user.Username);
                 
                  resp.writeHead(200, { 'Content-Type': 'text/html' });
                  resp.end(dashboardContent);
               });
            }
            else {
               console.log('Authentication failed, loading relogin');
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

   else {
      resp.writeHead(404, { 'Content-Type': 'text/html' });
      resp.end('404 Not Found');
   }

}).listen(3000);