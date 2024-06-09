// app.js
const express = require("express");
const https = require('https');
const fs = require('fs');
const path = require('path');

const cookieParser = require("cookie-parser");
const usersRouter = require("./routes/users.route");
const postsRouter = require("./routes/posts.route");
const commentsRouter = require("./routes/comments.route");
const app = express();

// Define paths to the certificate and key files
const certPath = path.join(__dirname,'config', 'server.cert');
const keyPath = path.join(__dirname,'config', 'server.key');

// Read the certificate and key files
const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
};

// const PORT = 3000;
const PORT = 443;

app.use(express.json());
app.use(cookieParser());
app.use('/api', [usersRouter, postsRouter, commentsRouter]);

// app.listen(PORT, () => {
//   console.log(PORT, '포트 번호로 서버가 실행되었습니다.');
// })
https.createServer(options, app).listen(PORT, ()=>{
  console.log('HTTPS Server running on port', PORT);
})