const Mongoose = require("mongoose");
const UserRegisterSchema = new Mongoose.Schema(
  {
    token: {
      type: String,
      require: false,
    },
    fullName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Mongoose.model("users", UserRegisterSchema);
