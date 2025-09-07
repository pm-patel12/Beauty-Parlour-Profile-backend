const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secret = "!@#%^$&&*()";
const UserRegisterSchema = require("../models/adminUser");
const saltRounds = 10;

const {
  Exception,
  loginFailed,
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
        return loginFailed(res, 404, "Invalid password");
      }

      // 🔑 generate a new token for every login (for admin + user)
      const token = jwt.sign({ id: user._id, role: user.role }, secret);
      const refreshToken = jwt.sign({ id: user._id, role: user.role }, secret);
      user.token = token;
      await user.save();

      const userData = {
        id: user._id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role,
      };

      return res.status(200).json({
        success: true,
        msg: "User login successfully",
        data: {
          access_token: token,
          refresh_token: refreshToken,
          user: userData,
        },
      });
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
      const refreshToken = jwt.sign(
        { phoneNumber, role: role || "user" },
        secret
      );

      const newUser = await UserRegisterSchema.create({
        fullName,
        phoneNumber,
        password: hashedPassword,
        role: role || "user",
        token,
      });

      const userData = {
        id: newUser._id,
        fullName: newUser.fullName,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
      };

      return res.status(201).json({
        success: true,
        msg: "User registered successfully",
        data: {
          access_token: token,
          refresh_token: refreshToken,
          user: userData,
        },
      });
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

  // Profile api
  async getProfile(req, res) {
    try {
      const user = await UserRegisterSchema.findById(req.user.id).select(
        "-password -__v"
      );
      if (!user) {
        return loginFailed(res, 404, "User not found");
      }

      return res.status(200).json({
        success: true,
        msg: "User profile fetched successfully",
        data: {
          user: {
            id: user._id,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      });
    } catch (err) {
      return Exception(
        res,
        500,
        "Something went wrong while fetching profile",
        err
      );
    }
  }
}

module.exports = new AuthController();
