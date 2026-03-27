import express from "express";
import {
    createStop,
    deleteStop,
    getStopsByRoute,
    updateStop
} from "../controllers/stop.controller.js";
import { authorizeRoles, verifyUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyUser, authorizeRoles("admin"), createStop);
router.get("/route/:routeId", verifyUser, getStopsByRoute);
router.put("/:id", verifyUser, authorizeRoles("admin"), updateStop);
router.delete("/:id", verifyUser, authorizeRoles("admin"), deleteStop);

export default router;