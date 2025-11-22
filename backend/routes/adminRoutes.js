import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { deleteRegistration } from "../controllers/eventController.js";

const router = express.Router();

router.delete("/registrations/:id", authMiddleware, deleteRegistration);

export default router;
