const express = require("express");
const cookiParser = require("cookie-parser");

const postsRouter = require("./routes/posts.js");
const commentsRouter = require("./routes/comments.js");
const userRouter = require("./routes/users.js");
const authRouter = require("./routes/auth.js");
const connect = require("./schemas/index.js");
connect();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookiParser());
app.use("/api", [postsRouter, commentsRouter, userRouter, authRouter]);

app.listen(8080, () => {
  console.log("서버가 켜졌어요!");
});
