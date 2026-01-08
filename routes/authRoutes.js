// routes/authRoutes.js
const express = require("express");
const router = express.Router();

const authControllerRaw = require("../controllers/authController");
const authController = authControllerRaw.default || authControllerRaw;

const { protect } = require("../middleware/authMiddleware");

const pickFn = (names, label) => {
  for (const name of names) {
    if (typeof authController?.[name] === "function") return authController[name];
  }
  throw new Error(
    `authRoutes.js: Missing controller function for "${label}". ` +
      `Expected one of: ${names.join(", ")}. ` +
      `Check exports in controllers/authController.js`
  );
};

const registerUser = pickFn(["registerUser", "signup", "register", "createUser"], "signup");
const loginUser = pickFn(["loginUser", "login", "signin"], "login");
const resetPassword = pickFn(["resetPassword", "forgotPassword", "requestPasswordReset"], "reset-password");
const getProfile = pickFn(["getProfile", "profile", "getMe", "me"], "get /me");
const updateProfile = pickFn(["updateProfile", "updateMe", "updateUser", "editProfile"], "put /me");

// ✅ new
const verifyPassword = pickFn(["verifyPassword"], "verify-password");
const changePassword = pickFn(["changePassword"], "change-password");
const deleteAccount = pickFn(["deleteAccount"], "delete-account");

// Routes
router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);

router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);

// ✅ Settings routes
router.post("/verify-password", protect, verifyPassword);
router.post("/change-password", protect, changePassword);
router.post("/delete-account", protect, deleteAccount);

module.exports = router;
