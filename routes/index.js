var express = require("express");
var router = express.Router();
const AuthController = require("../controllers/authController");
const checkJwtAuthentication = require("../authentication");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Hello World" });
});

// Login
router.post("/login", AuthController.loginUser);

// Register
router.post("/register", AuthController.registerUser);

// Logout
router.post("/logout", checkJwtAuthentication, (req, res) =>
  AuthController.logoutUser(req, res)
);

// Profile api
router.get("/profile", checkJwtAuthentication, (req, res) =>
  AuthController.getProfile(req, res)
);

module.exports = router;
