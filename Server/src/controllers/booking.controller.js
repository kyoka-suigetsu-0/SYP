import {
    cancelBooking as cancelBookingModel,
    createBooking as createBookingModel,
    getBookedSeats as getBookedSeatsModel,
    getBookingById,
    getBookingsByTrip as getBookingsByTripModel,
    getBookingsByUser
} from "../models/booking.model.js";
import { getStopById } from "../models/stop.model.js";
import { getTripById } from "../models/trip.model.js";
import { incrementCancellationCount, resetCancellationCount, getCancellationCount } from "../models/user.model.js";
import { createPenalty } from "../models/penalty.model.js";
import { sendError, sendSuccess } from "../utils/reponseHandler.js";
import { validateRequiredFields } from "../utils/validator.js";

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

const normalizeBoardingStopId = (boardingStopId) => {
    if (boardingStopId === undefined || boardingStopId === null || boardingStopId === "") {
        return null;
    }

    return Number(boardingStopId);
};

export const createBooking = async (req, res) => {
    try {
        const { trip_id, seat_number, boarding_stop_id } = req.body;

        const { isValid } = validateRequiredFields(req.body, [
            "trip_id",
            "seat_number"
        ]);

        if (!isValid) {
            return sendError(res, 400, "Please fill all the required fields");
        }

        const tripIdValidation = validatePositiveInteger(trip_id, "Trip ID");
        if (!tripIdValidation.isValid) {
            return sendError(res, 400, tripIdValidation.message);
        }

        const seatNumberValidation = validatePositiveInteger(seat_number, "Seat number");
        if (!seatNumberValidation.isValid) {
            return sendError(res, 400, seatNumberValidation.message);
        }

        const trip = await getTripById(Number(trip_id));
        if (!trip) {
            return sendError(res, 404, "Trip not found");
        }

        if (!["scheduled", "ongoing"].includes(trip.status)) {
            return sendError(res, 400, "Bookings are not allowed for this trip");
        }

        if (Number(seat_number) > Number(trip.total_seats || 0)) {
            return sendError(res, 400, "Seat number exceeds vehicle capacity");
        }

        const normalizedBoardingStopId = normalizeBoardingStopId(boarding_stop_id);
        if (normalizedBoardingStopId !== null) {
            const stopIdValidation = validatePositiveInteger(
                normalizedBoardingStopId,
                "Boarding stop ID"
            );
            if (!stopIdValidation.isValid) {
                return sendError(res, 400, stopIdValidation.message);
            }

            const stop = await getStopById(normalizedBoardingStopId);
            if (!stop) {
                return sendError(res, 404, "Boarding stop not found");
            }

            if (Number(stop.route_id) !== Number(trip.route_id)) {
                return sendError(res, 400, "Boarding stop does not belong to this trip route");
            }
        }

        const bookedSeats = await getBookedSeatsModel(Number(trip_id));
        const isSeatBooked = bookedSeats.some(
            (seat) => Number(seat.seat_number) === Number(seat_number)
        );

        if (isSeatBooked) {
            return sendError(res, 409, "Seat already booked for this trip");
        }

        const { insertId } = await createBookingModel(
            req.user.id,
            Number(trip_id),
            Number(seat_number),
            normalizedBoardingStopId
        );

        const myBookings = await getBookingsByUser(req.user.id);
        const booking = myBookings.find((item) => Number(item.id) === Number(insertId));

        return sendSuccess(res, 201, "Booking created successfully", booking || null);
    } catch (error) {
        console.error("Create booking failed: " + error);

        if (error.code === "ER_DUP_ENTRY") {
            return sendError(res, 409, "Seat already booked for this trip");
        }

        return sendError(res, 500, "Internal server error");
    }
};

export const getMyBookings = async (req, res) => {
    try {
        const bookings = await getBookingsByUser(req.user.id);

        return sendSuccess(res, 200, "Bookings fetched successfully", bookings);
    } catch (error) {
        console.error("Fetch my bookings failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const getBookingsByTrip = async (req, res) => {
    try {
        const { tripId } = req.params;

        const tripIdValidation = validatePositiveInteger(tripId, "Trip ID");
        if (!tripIdValidation.isValid) {
            return sendError(res, 400, tripIdValidation.message);
        }

        const trip = await getTripById(Number(tripId));
        if (!trip) {
            return sendError(res, 404, "Trip not found");
        }

        if (
            String(req.user.role).toLowerCase().trim() === "driver" &&
            Number(trip.driver_id) !== Number(req.user.id)
        ) {
            return sendError(res, 403, "Access denied for this trip");
        }

        const bookings = await getBookingsByTripModel(Number(tripId));

        return sendSuccess(res, 200, "Bookings fetched successfully", bookings);
    } catch (error) {
        console.error("Fetch bookings by trip failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const getBookedSeats = async (req, res) => {
    try {
        const { tripId } = req.params;

        const tripIdValidation = validatePositiveInteger(tripId, "Trip ID");
        if (!tripIdValidation.isValid) {
            return sendError(res, 400, tripIdValidation.message);
        }

        const trip = await getTripById(Number(tripId));
        if (!trip) {
            return sendError(res, 404, "Trip not found");
        }

        const bookedSeats = await getBookedSeatsModel(Number(tripId));

        return sendSuccess(res, 200, "Booked seats fetched successfully", bookedSeats);
    } catch (error) {
        console.error("Fetch booked seats failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const bookingIdValidation = validatePositiveInteger(id, "Booking ID");
        if (!bookingIdValidation.isValid) {
            return sendError(res, 400, bookingIdValidation.message);
        }

        const booking = await getBookingById(Number(id));
        if (!booking) {
            return sendError(res, 404, "Booking not found");
        }

        if (Number(booking.user_id) !== Number(req.user.id)) {
            return sendError(res, 403, "Access denied for this booking");
        }

        if (booking.status !== "booked") {
            return sendError(res, 400, "Only booked reservations can be cancelled");
        }

        if (booking.trip_status === "completed") {
            return sendError(res, 400, "Completed trip bookings cannot be cancelled");
        }

        // Cancel the booking
        await cancelBookingModel(Number(id));

        // Increment user's cancellation count
        try {
            await incrementCancellationCount(Number(booking.user_id));

            // Get updated cancellation count
            const currentCancellationCount = await getCancellationCount(Number(booking.user_id));

            // If cancellation count reaches 3, apply penalty and reset
            if (currentCancellationCount >= 3) {
                try {
                    await createPenalty(
                        Number(booking.user_id),
                        null,
                        10,
                        "Exceeded cancellation limit (3 cancellations)"
                    );

                    // Reset cancellation count after penalty
                    await resetCancellationCount(Number(booking.user_id));
                } catch (penaltyError) {
                    console.error("Failed to create cancellation penalty: " + penaltyError);
                    // Do not fail the cancellation, log and continue
                }
            }
        } catch (countError) {
            console.error("Failed to update cancellation count: " + countError);
            // Do not fail the cancellation, log and continue
        }

        return sendSuccess(res, 200, "Booking cancelled successfully", null);
    } catch (error) {
        console.error("Cancel booking failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};