import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// REGISTER
router.post("/register", registerUser);

// LOGIN
router.post("/login", loginUser);

// GET LOGGED-IN USER
router.get("/me", authMiddleware, async (req, res) => {
  res.json(req.user);
});

// CHANGE PASSWORD
router.put("/change-password", authMiddleware, async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: "Wrong old password" });
    }

    user.password = newPassword;
    await user.save();

    return res.json({
      success: true,
      message: "Password changed",
    });
  } catch (err) {
    console.error("Password change error:", err);
    next(err);
  }
});

// DELETE ACCOUNT
router.delete("/delete", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const deleted = await User.findByIdAndDelete(userId);

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    console.error("Delete error:", err);
    next(err);
  }
});

// UPDATE PROFILE
router.put("/update", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const updates = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    };

    const user = await User.findByIdAndUpdate(userId, updates, { new: true });

    res.json({
      success: true,
      message: "Profile updated",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

export default router;
