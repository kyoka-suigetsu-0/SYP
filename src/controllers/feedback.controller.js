import { getTripById } from "../models/trip.model.js";
import {
    createFeedback as createFeedbackModel,
    deleteFeedback as deleteFeedbackModel,
    getFeedbackById,
    getFeedbackByTrip as getFeedbackByTripModel,
    getFeedbackByUser as getFeedbackByUserModel
} from "../models/feedback.model.js";
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

const validateRating = (rating) => {
    const numericValue = Number(rating);

    if (!Number.isInteger(numericValue) || numericValue < 1 || numericValue > 5) {
        return {
            isValid: false,
            message: "Rating must be an integer between 1 and 5"
        };
    }

    return { isValid: true };
};

export const createFeedback = async (req, res) => {
    try {
        const { trip_id, rating, comment } = req.body;

        const { isValid } = validateRequiredFields(req.body, ["trip_id", "rating"]);
        if (!isValid) {
            return sendError(res, 400, "Please fill all the required fields");
        }

        const tripIdValidation = validatePositiveInteger(trip_id, "Trip ID");
        if (!tripIdValidation.isValid) {
            return sendError(res, 400, tripIdValidation.message);
        }

        const ratingValidation = validateRating(rating);
        if (!ratingValidation.isValid) {
            return sendError(res, 400, ratingValidation.message);
        }

        const trip = await getTripById(Number(trip_id));
        if (!trip) {
            return sendError(res, 404, "Trip not found");
        }

        const feedback = await createFeedbackModel(
            req.user.id,
            Number(trip_id),
            Number(rating),
            comment || null
        );

        return sendSuccess(res, 201, "Feedback created successfully", feedback);
    } catch (error) {
        console.error("Create feedback failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const getFeedbackByTrip = async (req, res) => {
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

        const feedbacks = await getFeedbackByTripModel(Number(tripId));

        return sendSuccess(res, 200, "Feedback fetched successfully", feedbacks);
    } catch (error) {
        console.error("Fetch feedback by trip failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const getMyFeedback = async (req, res) => {
    try {
        const feedbacks = await getFeedbackByUserModel(req.user.id);

        return sendSuccess(res, 200, "Feedback fetched successfully", feedbacks);
    } catch (error) {
        console.error("Fetch my feedback failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;

        const idValidation = validatePositiveInteger(id, "Feedback ID");
        if (!idValidation.isValid) {
            return sendError(res, 400, idValidation.message);
        }

        const feedback = await getFeedbackById(Number(id));
        if (!feedback) {
            return sendError(res, 404, "Feedback not found");
        }

        const userRole = String(req.user.role || "").toLowerCase().trim();
        const isAdmin = userRole === "admin";

        if (!isAdmin && Number(feedback.user_id) !== Number(req.user.id)) {
            return sendError(res, 403, "Access denied for this feedback");
        }

        await deleteFeedbackModel(Number(id));

        return sendSuccess(res, 200, "Feedback deleted successfully", null);
    } catch (error) {
        console.error("Delete feedback failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};
