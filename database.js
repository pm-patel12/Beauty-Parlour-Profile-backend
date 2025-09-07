const mongoose = require("mongoose");
require("dotenv").config();
// console.log(process.env.MONGO_URL, "data mongo");

const connection = mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((_connect) => {
    console.log("connected to database");
  })
  .catch((err) => {
    console.log("Error connecting to database", err);
  });

module.exports = connection;

