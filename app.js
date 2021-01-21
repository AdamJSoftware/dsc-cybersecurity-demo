/* eslint-disable no-console */
const mongoose = require("mongoose");

const app = require("./server");
require("dotenv").config();

mongoose
  .connect("mongodb://localhost:27017/dsc", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("DATABASE CONNECTION: SUCCESS"));

///////////////////////
// (4) START THE SERVER
app.listen(process.env.PORT, () => {
  console.log(`Running on port ${process.env.PORT}...`);
});
