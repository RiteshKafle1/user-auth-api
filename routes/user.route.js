const express = require("express");
const router = express.Router();

const {
  createUser,
  loginUser,
  logoutUser,
  getAllUser,
  getCurrentUserProfile,
  updateCurrentProfile,
  deleteUser,
  getUserById,
} = require("../controllers/user.controller");

const { authenticate, authorizeAdmin } = require("../middlewares/auth");

// create and get user
router
  .route("/")
  .post(createUser)
  .get(authenticate, authorizeAdmin, getAllUser);

// login and logout user
router.route("/auth").post(loginUser);
router.post("/logout", logoutUser);

// get and update user profile
router
  .route("/profile")
  .get(authenticate, getCurrentUserProfile)
  .put(authenticate, updateCurrentProfile);
  
// admin
// get user and delete user
router
  .route("/:id")
  .delete(authenticate, authorizeAdmin, deleteUser)
  .get(authenticate, authorizeAdmin, getUserById);

module.exports = router;
