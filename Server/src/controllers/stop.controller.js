import {
    createStop as createStopModel,
    deleteStop as deleteStopModel,
    getStopById,
    getStopsByRoute as getStopsByRouteModel,
    updateStop as updateStopModel
} from "../models/stop.model.js";
import { getRouteById } from "../models/route.model.js";
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

const validateNonNegativeInteger = (value, fieldName) => {
    const numericValue = Number(value);

    if (!Number.isInteger(numericValue) || numericValue < 0) {
        return {
            isValid: false,
            message: `${fieldName} must be a non-negative integer`
        };
    }

    return { isValid: true };
};

export const createStop = async (req, res) => {
    try {
        const { route_id, stop_name, stop_order, arrival_offset_minutes } = req.body;

        const { isValid } = validateRequiredFields(req.body, [
            "route_id",
            "stop_name",
            "stop_order"
        ]);

        if (!isValid || arrival_offset_minutes === undefined || arrival_offset_minutes === null || arrival_offset_minutes === "") {
            return sendError(res, 400, "Please fill all the required fields");
        }

        const routeIdValidation = validatePositiveInteger(route_id, "Route ID");
        if (!routeIdValidation.isValid) {
            return sendError(res, 400, routeIdValidation.message);
        }

        const stopOrderValidation = validatePositiveInteger(stop_order, "Stop order");
        if (!stopOrderValidation.isValid) {
            return sendError(res, 400, stopOrderValidation.message);
        }

        const offsetValidation = validateNonNegativeInteger(
            arrival_offset_minutes,
            "Arrival offset minutes"
        );
        if (!offsetValidation.isValid) {
            return sendError(res, 400, offsetValidation.message);
        }

        const route = await getRouteById(route_id);
        if (!route) {
            return sendError(res, 404, "Route not found");
        }

        const { insertId } = await createStopModel(
            Number(route_id),
            stop_name,
            Number(stop_order),
            Number(arrival_offset_minutes)
        );

        const stop = await getStopById(insertId);

        return sendSuccess(res, 201, "Stop created successfully", stop);
    } catch (error) {
        console.error("Create stop failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const getStopsByRoute = async (req, res) => {
    try {
        const { routeId } = req.params;

        const routeIdValidation = validatePositiveInteger(routeId, "Route ID");
        if (!routeIdValidation.isValid) {
            return sendError(res, 400, routeIdValidation.message);
        }

        const route = await getRouteById(routeId);
        if (!route) {
            return sendError(res, 404, "Route not found");
        }

        const stops = await getStopsByRouteModel(Number(routeId));

        return sendSuccess(res, 200, "Stops fetched successfully", stops);
    } catch (error) {
        console.error("Fetch stops failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const updateStop = async (req, res) => {
    try {
        const { id } = req.params;
        const { stop_name, stop_order, arrival_offset_minutes } = req.body;

        const stopIdValidation = validatePositiveInteger(id, "Stop ID");
        if (!stopIdValidation.isValid) {
            return sendError(res, 400, stopIdValidation.message);
        }

        const { isValid } = validateRequiredFields(req.body, [
            "stop_name",
            "stop_order"
        ]);

        if (!isValid || arrival_offset_minutes === undefined || arrival_offset_minutes === null || arrival_offset_minutes === "") {
            return sendError(res, 400, "Please fill all the required fields");
        }

        const stopOrderValidation = validatePositiveInteger(stop_order, "Stop order");
        if (!stopOrderValidation.isValid) {
            return sendError(res, 400, stopOrderValidation.message);
        }

        const offsetValidation = validateNonNegativeInteger(
            arrival_offset_minutes,
            "Arrival offset minutes"
        );
        if (!offsetValidation.isValid) {
            return sendError(res, 400, offsetValidation.message);
        }

        const existingStop = await getStopById(Number(id));
        if (!existingStop) {
            return sendError(res, 404, "Stop not found");
        }

        await updateStopModel(
            Number(id),
            stop_name,
            Number(stop_order),
            Number(arrival_offset_minutes)
        );

        const updatedStop = await getStopById(Number(id));

        return sendSuccess(res, 200, "Stop updated successfully", updatedStop);
    } catch (error) {
        console.error("Update stop failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const deleteStop = async (req, res) => {
    try {
        const { id } = req.params;

        const stopIdValidation = validatePositiveInteger(id, "Stop ID");
        if (!stopIdValidation.isValid) {
            return sendError(res, 400, stopIdValidation.message);
        }

        const existingStop = await getStopById(Number(id));
        if (!existingStop) {
            return sendError(res, 404, "Stop not found");
        }

        await deleteStopModel(Number(id));

        return sendSuccess(res, 200, "Stop deleted successfully", null);
    } catch (error) {
        console.error("Delete stop failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};