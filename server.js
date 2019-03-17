const express = require("express");
const morgan = require("morgan");

const bprouter = require("./blogPostsRouter");

const app = express();

app.use(morgan("common"));
app.use(express.json());

// you need to import `blogPostsRouter` router and route

// requests to HTTP requests to `/blog-posts` to `blogPostsRouter`
app.use('/blog-posts', bprouter);

// both runServer and closeServer need to access the same
// server object, so we declare `server` here, and then when
// runServer runs, it assigns a value.
let server;

function runServer() {
  const port = process.env.PORT || 8080;
  return new Promise((resolve, reject) => {
    server = app.listen(port, () => {
      console.log(`Your app is listening on port ${port}`);
      resolve(server); 
    })
    .on("error", err => {
      reject(err);
    });
  })
}

function closeServer() {
  return new Promise((resolve, reject) => {
    console.log("closing server");
    server.close(err => {
      if(err) {
        reject(err);
        // so we don't also call `resolve()`
        return;
      }
      resolve();
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
