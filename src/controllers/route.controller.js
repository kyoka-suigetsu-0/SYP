import {
    createRoute as createRouteModel,
    deleteRoute as deleteRouteModel,
    getAllRoutes,
    getRouteById,
    updateRoute as updateRouteModel
} from "../models/route.model.js";
import { sendError, sendSuccess } from "../utils/reponseHandler.js";
import { validateRequiredFields, validatePositiveNumber } from "../utils/validator.js";

export const createRoute = async (req, res) => {
    try {
        const {
            route_name,
            start_location,
            end_location,
            distance_km,
            estimated_time
        } = req.body;

        const { isValid } = validateRequiredFields(req.body, [
            "route_name",
            "start_location",
            "end_location",
            "distance_km",
            "estimated_time"
        ]);

        if (!isValid) {
            return sendError(res, 400, "Please fill all the required fields");
        }

        const { isValid: isDistanceValid, message: distanceMessage } = validatePositiveNumber(
            distance_km,
            "Distance (km)"
        );
        if (!isDistanceValid) {
            return sendError(res, 400, distanceMessage);
        }

        const { isValid: isTimeValid, message: timeMessage } = validatePositiveNumber(
            estimated_time,
            "Estimated time (minutes)"
        );
        if (!isTimeValid) {
            return sendError(res, 400, timeMessage);
        }

        const { insertId } = await createRouteModel(
            route_name,
            start_location,
            end_location,
            distance_km,
            estimated_time
        );

        const route = await getRouteById(insertId);

        return sendSuccess(res, 201, "Route created successfully", route);
    } catch (error) {
        console.error("Create route failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const getRoutes = async (req, res) => {
    try {
        const routes = await getAllRoutes();

        return sendSuccess(res, 200, "Routes fetched successfully", routes);
    } catch (error) {
        console.error("Fetch routes failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const getRoute = async (req, res) => {
    try {
        const { id } = req.params;

        const route = await getRouteById(id);

        if (!route) {
            return sendError(res, 404, "Route not found");
        }

        return sendSuccess(res, 200, "Route fetched successfully", route);
    } catch (error) {
        console.error("Fetch route failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const updateRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            route_name,
            start_location,
            end_location,
            distance_km,
            estimated_time
        } = req.body;

        const { isValid } = validateRequiredFields(req.body, [
            "route_name",
            "start_location",
            "end_location",
            "distance_km",
            "estimated_time"
        ]);

        if (!isValid) {
            return sendError(res, 400, "Please fill all the required fields");
        }

        const { isValid: isDistanceValid, message: distanceMessage } = validatePositiveNumber(
            distance_km,
            "Distance (km)"
        );
        if (!isDistanceValid) {
            return sendError(res, 400, distanceMessage);
        }

        const { isValid: isTimeValid, message: timeMessage } = validatePositiveNumber(
            estimated_time,
            "Estimated time (minutes)"
        );
        if (!isTimeValid) {
            return sendError(res, 400, timeMessage);
        }

        const existingRoute = await getRouteById(id);

        if (!existingRoute) {
            return sendError(res, 404, "Route not found");
        }

        await updateRouteModel(
            id,
            route_name,
            start_location,
            end_location,
            distance_km,
            estimated_time
        );

        const updatedRoute = await getRouteById(id);

        return sendSuccess(res, 200, "Route updated successfully", updatedRoute);
    } catch (error) {
        console.error("Update route failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const deleteRoute = async (req, res) => {
    try {
        const { id } = req.params;

        const existingRoute = await getRouteById(id);

        if (!existingRoute) {
            return sendError(res, 404, "Route not found");
        }

        await deleteRouteModel(id);

        return sendSuccess(res, 200, "Route deleted successfully", null);
    } catch (error) {
        console.error("Delete route failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};