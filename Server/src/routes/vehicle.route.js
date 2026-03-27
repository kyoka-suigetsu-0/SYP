import express from "express";
import {
    createVehicle,
    deleteVehicle,
    getVehicle,
    getVehicles,
    updateVehicle
} from "../controllers/vehicle.controller.js";
import { authorizeRoles, verifyUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyUser, authorizeRoles("admin"), createVehicle);
router.get("/", verifyUser, getVehicles);
router.get("/:id", verifyUser, getVehicle);
router.put("/:id", verifyUser, authorizeRoles("admin"), updateVehicle);
router.delete("/:id", verifyUser, authorizeRoles("admin"), deleteVehicle);

export default router;