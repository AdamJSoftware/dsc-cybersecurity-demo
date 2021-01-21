const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");

// env config
dotenv.config();

const userRouter = require("./routes/user.routes");
const postRouter = require("./routes/post.routes");

const app = express();
app.use(cors());

app.use(express.json({ limit: "10kb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);

module.exports = app;
