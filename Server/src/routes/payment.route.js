import express from "express";
import {
    createPayment,
    getAllPayments,
    getMyPayments,
    getPaymentByBooking
} from "../controllers/payment.controller.js";
import { authorizeRoles, verifyUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyUser, authorizeRoles("passenger"), createPayment);
router.get("/my", verifyUser, getMyPayments);
router.get("/booking/:bookingId", verifyUser, getPaymentByBooking);
router.get("/", verifyUser, authorizeRoles("admin"), getAllPayments);

export default router;
