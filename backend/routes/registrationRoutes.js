import express from "express";
import {
  registerUser,
  getRegistrations,
  getUserRegistrations,
  unregisterEvent,
} from "../controllers/registrationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, registerUser);
router.get("/", authMiddleware, getRegistrations);
router.get("/user/:userId", authMiddleware, getUserRegistrations);
router.delete("/:eventId", authMiddleware, unregisterEvent);

export default router;
