import express from "express";
import {
    createEmergencyReport,
    getAllReports,
    resolveReport
} from "../controllers/emergency.controller.js";
import { authorizeRoles, verifyUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyUser, authorizeRoles("driver"), createEmergencyReport);
router.get("/", verifyUser, authorizeRoles("admin"), getAllReports);
router.patch("/:id/resolve", verifyUser, authorizeRoles("admin"), resolveReport);

export default router;
