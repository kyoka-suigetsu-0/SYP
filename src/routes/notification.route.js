import express from "express";
import {
    createNotification,
    getAllNotifications,
    getMyNotifications,
    markAsRead
} from "../controllers/notification.controller.js";
import { authorizeRoles, verifyUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyUser, authorizeRoles("admin"), createNotification);
router.get("/my", verifyUser, getMyNotifications);
router.patch("/:id/read", verifyUser, markAsRead);
router.get("/", verifyUser, authorizeRoles("admin"), getAllNotifications);

export default router;
