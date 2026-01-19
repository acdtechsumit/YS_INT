const http = require('http');
const fs = require('fs');
const querystring = require('querystring');

http.createServer((req, resp) => {

   if (req.url === '/') {
      fs.readFile('login.html', (err, login) => {
         if (err) {
            resp.writeHead(404, { 'Content-Type': 'text/html' });
            return resp.end('404 Not Found');
         }
         resp.end(login);
      });
   }


   else if (req.url === '/login' && req.method === 'POST') {
      let logindata = [];

      req.on('data', chunk => {
         logindata.push(chunk);
      });

      req.on('end', () => {
         let loginrawdata = Buffer.concat(logindata).toString();
         let readabledata = querystring.parse(loginrawdata);

         console.log(readabledata);

         if (readabledata.Username === 'sumit' && readabledata.password === 'sumit') {
            fs.readFile('dashboard.html', (err, dashboard) => {
               if (err) {
                  resp.writeHead(404, { 'Content-Type': 'text/html' });
                  return resp.end('404 Not Found');
               }
               
               let dashboardContent = dashboard.toString();
               dashboardContent = dashboardContent.replace('{{username}}', readabledata.Username);
              
               resp.writeHead(200, { 'Content-Type': 'text/html' });
               resp.end(dashboardContent);
            });
         }
         else {
            fs.readFile('relogin.html', (err, relogin) => {
               if (err) {
                  resp.writeHead(404, { 'Content-Type': 'text/html' });
                  return resp.end('404 Not Found');
               }
               resp.writeHead(200, { 'Content-Type': 'text/html' });
               resp.end(relogin);
            });
         }
      });
   }
   else if (req.url === '/dashboard') {
      fs.readFile('dashboard.html', (err, dashboard) => {
         if (err) {
            resp.writeHead(404, { 'Content-Type': 'text/html' });
            return resp.end('404 Not Found');
         }
         resp.writeHead(200, { 'Content-Type': 'text/html' });
         resp.end(dashboard);
      });
   }


   else {
      resp.writeHead(404, { 'Content-Type': 'text/html' });
      resp.end('404 Not Found');
   }

}).listen(3000);