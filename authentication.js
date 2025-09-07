const jwt = require("jsonwebtoken");
const secret = "!@#%^$&&*()";
const UserRegisterSchema = require("./models/adminUser");

async function checkJwtAuthentication(req, res, next) {
  try {
    if (!req.headers || !req.headers.authorization) {
      return res.status(401).json({
        success: false,
        error: true,
        data: [],
        msg: "Authorization token is required",
      });
    }

    const parts = req.headers.authorization.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(400).json({
        success: false,
        error: true,
        data: [],
        msg: "Invalid authorization header format. Use Bearer <token>",
      });
    }

    const token = parts[1];

    const decoded = jwt.verify(token, secret);

    const user = await UserRegisterSchema.findOne({ token });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: true,
        data: [],
        msg: "Invalid or expired token",
      });
    }

    req.user = {
      id: user._id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      token,
    };

    return next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({
      success: false,
      error: true,
      data: [],
      msg: "Token authentication failed",
    });
  }
}

module.exports = checkJwtAuthentication;
