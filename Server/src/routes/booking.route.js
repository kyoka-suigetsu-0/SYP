import express from "express";
import {
    cancelBooking,
    createBooking,
    getBookedSeats,
    getBookingsByTrip,
    getMyBookings
} from "../controllers/booking.controller.js";
import { authorizeRoles, verifyUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyUser, authorizeRoles("passenger"), createBooking);
router.get("/my", verifyUser, getMyBookings);
router.get("/trip/:tripId", verifyUser, authorizeRoles("admin", "driver"), getBookingsByTrip);
router.get("/trip/:tripId/seats", verifyUser, getBookedSeats);
router.patch("/:id/cancel", verifyUser, authorizeRoles("passenger"), cancelBooking);

export default router;