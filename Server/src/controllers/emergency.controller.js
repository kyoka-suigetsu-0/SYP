import { getTripById } from "../models/trip.model.js";
import { findUserById } from "../models/user.model.js";
import {
    createEmergencyReport as createEmergencyReportModel,
    getAllReports as getAllReportsModel,
    getReportById,
    resolveReport as resolveReportModel
} from "../models/emergencyReport.model.js";
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

const normalizeNullableTripId = (value) => {
    if (value === undefined || value === null || value === "") {
        return null;
    }

    return Number(value);
};

export const createEmergencyReport = async (req, res) => {
    try {
        const { trip_id, message } = req.body;

        const { isValid } = validateRequiredFields(req.body, ["message"]);
        if (!isValid) {
            return sendError(res, 400, "Please fill all the required fields");
        }

        const normalizedTripId = normalizeNullableTripId(trip_id);
        if (normalizedTripId !== null) {
            const tripIdValidation = validatePositiveInteger(normalizedTripId, "Trip ID");
            if (!tripIdValidation.isValid) {
                return sendError(res, 400, tripIdValidation.message);
            }

            const trip = await getTripById(normalizedTripId);
            if (!trip) {
                return sendError(res, 404, "Trip not found");
            }
        }

        const report = await createEmergencyReportModel(
            normalizedTripId,
            req.user.id,
            message
        );

        return sendSuccess(res, 201, "Emergency report created successfully", report);
    } catch (error) {
        console.error("Create emergency report failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const getAllReports = async (req, res) => {
    try {
        const reports = await getAllReportsModel();

        return sendSuccess(res, 200, "Emergency reports fetched successfully", reports);
    } catch (error) {
        console.error("Fetch all emergency reports failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const resolveReport = async (req, res) => {
    try {
        const { id } = req.params;

        const idValidation = validatePositiveInteger(id, "Report ID");
        if (!idValidation.isValid) {
            return sendError(res, 400, idValidation.message);
        }

        const report = await getReportById(Number(id));
        if (!report) {
            return sendError(res, 404, "Emergency report not found");
        }

        if (report.status === "resolved") {
            return sendError(res, 400, "Report is already resolved");
        }

        await resolveReportModel(Number(id));

        const updatedReport = await getReportById(Number(id));

        return sendSuccess(res, 200, "Emergency report resolved", updatedReport || null);
    } catch (error) {
        console.error("Resolve emergency report failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};
