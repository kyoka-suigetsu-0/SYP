import express from "express";
import {
    createFeedback,
    deleteFeedback,
    getFeedbackByTrip,
    getMyFeedback
} from "../controllers/feedback.controller.js";
import { authorizeRoles, verifyUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyUser, authorizeRoles("passenger"), createFeedback);
router.get("/trip/:tripId", verifyUser, authorizeRoles("admin"), getFeedbackByTrip);
router.get("/my", verifyUser, getMyFeedback);
router.delete("/:id", verifyUser, deleteFeedback);

export default router;
