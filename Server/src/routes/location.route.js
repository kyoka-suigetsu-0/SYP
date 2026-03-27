import express from "express";
import {
    getAllLocations,
    getVehicleLocation,
    updateLocation
} from "../controllers/location.controller.js";
import { authorizeRoles, verifyUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/update", verifyUser, authorizeRoles("driver"), updateLocation);
router.get("/vehicle/:vehicleId", verifyUser, getVehicleLocation);
router.get("/", verifyUser, authorizeRoles("admin"), getAllLocations);

export default router;