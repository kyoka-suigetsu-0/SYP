import express from "express";
import { getStats } from "../controllers/admin.controller.js";
import { authorizeRoles, verifyUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/stats", verifyUser, authorizeRoles("admin"), getStats);

export default router;
