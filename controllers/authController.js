const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secret = "!@#%^$&&*()";
const UserRegisterSchema = require("../models/adminUser");
const saltRounds = 10;

const {
  Exception,
  loginFailed,
  loginSuccess,
  successDetails,
} = require("../utils/exceptionHandler");

class AuthController {
  // Login
  async loginUser(req, res) {
    try {
      const { phoneNumber, password } = req.body;

      if (!phoneNumber || !password) {
        return Exception(res, 400, "Phone number and password are required");
      }

      const user = await UserRegisterSchema.findOne({ phoneNumber });

      if (!user) {
        return loginFailed(res, 404, "User does not exist");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return loginFailed(res, 401, "Invalid password");
      }

      // 🔑 generate a new token for every login (for admin + user)
      const token = jwt.sign({ id: user._id, role: user.role }, secret);

      user.token = token; // update DB with new token
      await user.save();

      return loginSuccess(res, user, 200, "User login successful", token);
    } catch (err) {
      return Exception(res, 500, "Something went wrong during login", err);
    }
  }

  // Register
  async registerUser(req, res) {
    try {
      const { fullName, phoneNumber, password, confirmPassword, role } =
        req.body;

      if (!fullName || !phoneNumber || !password || !confirmPassword) {
        return Exception(res, 400, "Please provide all required fields");
      }

      if (password !== confirmPassword) {
        return loginFailed(
          res,
          400,
          "Password and confirm password do not match"
        );
      }

      // 🔍 Check if phone number already exists
      const existingUser = await UserRegisterSchema.findOne({ phoneNumber });
      if (existingUser) {
        return Exception(
          res,
          409,
          "This phone number is already registered. Please login or use another number."
        );
      }

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 🔑 generate token on registration (for admin + user)
      const token = jwt.sign({ phoneNumber, role: role || "user" }, secret);

      const newUser = await UserRegisterSchema.create({
        fullName,
        phoneNumber,
        password: hashedPassword,
        role: role || "user",
        token,
      });

      return successDetails(res, 201, "User registered successfully", newUser);
    } catch (err) {
      return Exception(
        res,
        500,
        "Something went wrong during registration",
        err
      );
    }
  }

  // Logout
  async logoutUser(req, res) {
    try {
      const user = await UserRegisterSchema.findById(req.user.id);

      if (!user) {
        return loginFailed(res, 404, "User not found");
      }

      // Clear token for both admin + user
      user.token = null;
      await user.save();

      return successDetails(res, 200, "User logged out successfully");
    } catch (err) {
      return Exception(res, 500, "Something went wrong during logout", err);
    }
  }
}

module.exports = new AuthController();
