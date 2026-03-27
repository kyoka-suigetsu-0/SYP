import express from "express";
import {
    createTrip,
    deleteTrip,
    endTrip,
    getTrip,
    getTrips,
    getTripsByRoute,
    startTrip,
    updateTrip
} from "../controllers/trip.controller.js";
import { authorizeRoles, verifyUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyUser, authorizeRoles("admin"), createTrip);
router.get("/", verifyUser, getTrips);
router.get("/route/:routeId", verifyUser, getTripsByRoute);
router.get("/:id", verifyUser, getTrip);
router.put("/:id", verifyUser, authorizeRoles("admin"), updateTrip);
router.delete("/:id", verifyUser, authorizeRoles("admin"), deleteTrip);
router.patch("/:id/start", verifyUser, authorizeRoles("driver"), startTrip);
router.patch("/:id/end", verifyUser, authorizeRoles("driver"), endTrip);

export default router;