import { getBookingById } from "../models/booking.model.js";
import {
    createPayment as createPaymentModel,
    getAllPayments as getAllPaymentsModel,
    getPaymentByBooking as getPaymentByBookingModel,
    getPaymentsByUser as getPaymentsByUserModel
} from "../models/payment.model.js";
import { sendError, sendSuccess } from "../utils/reponseHandler.js";
import { validatePositiveNumber, validateRequiredFields } from "../utils/validator.js";

const PAYMENT_METHODS = ["QR", "cash"];

const validatePositiveInteger = (value, fieldName) => {
    const numericValue = Number(value);

    if (!Number.isInteger(numericValue) || numericValue <= 0) {
        return {
            isValid: false,
            message: `${fieldName} must be a positive integer`
        };
    }

    return { isValid: true };
};

const normalizePaymentMethod = (paymentMethod) => {
    if (!paymentMethod) {
        return "QR";
    }

    const normalized = String(paymentMethod).trim().toLowerCase();

    if (normalized === "qr") {
        return "QR";
    }

    if (normalized === "cash") {
        return "cash";
    }

    return null;
};

export const createPayment = async (req, res) => {
    try {
        const { booking_id, amount, payment_method } = req.body;

        const { isValid } = validateRequiredFields(req.body, ["booking_id", "amount"]);
        if (!isValid) {
            return sendError(res, 400, "Please fill all the required fields");
        }

        const bookingIdValidation = validatePositiveInteger(booking_id, "Booking ID");
        if (!bookingIdValidation.isValid) {
            return sendError(res, 400, bookingIdValidation.message);
        }

        const amountValidation = validatePositiveNumber(amount, "Amount");
        if (!amountValidation.isValid) {
            return sendError(res, 400, amountValidation.message);
        }

        const normalizedPaymentMethod = normalizePaymentMethod(payment_method);
        if (!normalizedPaymentMethod || !PAYMENT_METHODS.includes(normalizedPaymentMethod)) {
            return sendError(res, 400, "Payment method must be QR or cash");
        }

        const booking = await getBookingById(Number(booking_id));
        if (!booking) {
            return sendError(res, 404, "Booking not found");
        }

        if (Number(booking.user_id) !== Number(req.user.id)) {
            return sendError(res, 403, "You can only pay for your own bookings");
        }

        const payment = await createPaymentModel(
            Number(booking_id),
            Number(amount),
            normalizedPaymentMethod
        );

        return sendSuccess(res, 201, "Payment created successfully", payment || null);
    } catch (error) {
        console.error("Create payment failed: " + error);

        if (error.statusCode) {
            return sendError(res, error.statusCode, error.message);
        }

        return sendError(res, 500, "Internal server error");
    }
};

export const getMyPayments = async (req, res) => {
    try {
        const payments = await getPaymentsByUserModel(req.user.id);

        return sendSuccess(res, 200, "Payments fetched successfully", payments);
    } catch (error) {
        console.error("Fetch my payments failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const getPaymentByBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const bookingIdValidation = validatePositiveInteger(bookingId, "Booking ID");
        if (!bookingIdValidation.isValid) {
            return sendError(res, 400, bookingIdValidation.message);
        }

        const booking = await getBookingById(Number(bookingId));
        if (!booking) {
            return sendError(res, 404, "Booking not found");
        }

        const userRole = String(req.user.role || "").toLowerCase().trim();
        const isAdmin = userRole === "admin";

        if (!isAdmin && Number(booking.user_id) !== Number(req.user.id)) {
            return sendError(res, 403, "Access denied for this booking");
        }

        const payment = await getPaymentByBookingModel(Number(bookingId));
        if (!payment) {
            return sendError(res, 404, "Payment not found for this booking");
        }

        return sendSuccess(res, 200, "Payment fetched successfully", payment);
    } catch (error) {
        console.error("Fetch payment by booking failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const getAllPayments = async (req, res) => {
    try {
        const payments = await getAllPaymentsModel();

        return sendSuccess(res, 200, "Payments fetched successfully", payments);
    } catch (error) {
        console.error("Fetch all payments failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};
