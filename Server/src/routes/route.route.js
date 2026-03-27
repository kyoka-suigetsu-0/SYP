import express from "express";
import {
    createRoute,
    deleteRoute,
    getRoute,
    getRoutes,
    updateRoute
} from "../controllers/route.controller.js";
import { authorizeRoles, verifyUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyUser, authorizeRoles("admin"), createRoute);
router.get("/", verifyUser, getRoutes);
router.get("/:id", verifyUser, getRoute);
router.put("/:id", verifyUser, authorizeRoles("admin"), updateRoute);
router.delete("/:id", verifyUser, authorizeRoles("admin"), deleteRoute);

export default router;