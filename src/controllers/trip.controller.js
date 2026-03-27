import {
    createTrip as createTripModel,
    deleteTrip as deleteTripModel,
    endTrip as endTripModel,
    getAllTrips,
    getTripById,
    getTripsByRoute as getTripsByRouteModel,
    startTrip as startTripModel,
    updateTrip as updateTripModel
} from "../models/trip.model.js";
import { getRouteById } from "../models/route.model.js";
import { getVehicleById } from "../models/vehicle.model.js";
import { createPenalty } from "../models/penalty.model.js";
import { createNotification } from "../models/notification.model.js";
import { sendError, sendSuccess } from "../utils/reponseHandler.js";
import { validateRequiredFields } from "../utils/validator.js";

const TRIP_STATUSES = ["scheduled", "ongoing", "completed", "cancelled"];

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

const validateTripDate = (tripDate) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(tripDate))) {
        return {
            isValid: false,
            message: "Trip date must be in YYYY-MM-DD format"
        };
    }

    const parsedDate = new Date(`${tripDate}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) {
        return {
            isValid: false,
            message: "Trip date must be a valid date"
        };
    }

    return { isValid: true };
};

const validateDepartureTime = (departureTime) => {
    if (!/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/.test(String(departureTime))) {
        return {
            isValid: false,
            message: "Departure time must be in HH:MM or HH:MM:SS format"
        };
    }

    return { isValid: true };
};

const validateTripStatus = (status) => {
    const normalizedStatus = String(status).toLowerCase().trim();

    if (!TRIP_STATUSES.includes(normalizedStatus)) {
        return {
            isValid: false,
            message: `Status must be one of: ${TRIP_STATUSES.join(", ")}`
        };
    }

    return {
        isValid: true,
        normalizedStatus
    };
};

const validateRouteAndVehicle = async (routeId, vehicleId) => {
    const route = await getRouteById(routeId);
    if (!route) {
        return {
            isValid: false,
            statusCode: 404,
            message: "Route not found"
        };
    }

    const vehicle = await getVehicleById(vehicleId);
    if (!vehicle) {
        return {
            isValid: false,
            statusCode: 404,
            message: "Vehicle not found"
        };
    }

    return {
        isValid: true,
        vehicle
    };
};

export const createTrip = async (req, res) => {
    try {
        const { route_id, vehicle_id, trip_date, departure_time } = req.body;

        const { isValid } = validateRequiredFields(req.body, [
            "route_id",
            "vehicle_id",
            "trip_date",
            "departure_time"
        ]);

        if (!isValid) {
            return sendError(res, 400, "Please fill all the required fields");
        }

        const routeValidation = validatePositiveInteger(route_id, "Route ID");
        if (!routeValidation.isValid) {
            return sendError(res, 400, routeValidation.message);
        }

        const vehicleValidation = validatePositiveInteger(vehicle_id, "Vehicle ID");
        if (!vehicleValidation.isValid) {
            return sendError(res, 400, vehicleValidation.message);
        }

        const tripDateValidation = validateTripDate(trip_date);
        if (!tripDateValidation.isValid) {
            return sendError(res, 400, tripDateValidation.message);
        }

        const departureTimeValidation = validateDepartureTime(departure_time);
        if (!departureTimeValidation.isValid) {
            return sendError(res, 400, departureTimeValidation.message);
        }

        const referenceValidation = await validateRouteAndVehicle(
            Number(route_id),
            Number(vehicle_id)
        );
        if (!referenceValidation.isValid) {
            return sendError(
                res,
                referenceValidation.statusCode,
                referenceValidation.message
            );
        }

        const { insertId } = await createTripModel(
            Number(route_id),
            Number(vehicle_id),
            trip_date,
            departure_time
        );

        const trip = await getTripById(insertId);

        return sendSuccess(res, 201, "Trip created successfully", trip);
    } catch (error) {
        console.error("Create trip failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const getTrips = async (req, res) => {
    try {
        const trips = await getAllTrips();

        return sendSuccess(res, 200, "Trips fetched successfully", trips);
    } catch (error) {
        console.error("Fetch trips failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const getTrip = async (req, res) => {
    try {
        const { id } = req.params;

        const tripIdValidation = validatePositiveInteger(id, "Trip ID");
        if (!tripIdValidation.isValid) {
            return sendError(res, 400, tripIdValidation.message);
        }

        const trip = await getTripById(Number(id));
        if (!trip) {
            return sendError(res, 404, "Trip not found");
        }

        return sendSuccess(res, 200, "Trip fetched successfully", trip);
    } catch (error) {
        console.error("Fetch trip failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const getTripsByRoute = async (req, res) => {
    try {
        const { routeId } = req.params;

        const routeIdValidation = validatePositiveInteger(routeId, "Route ID");
        if (!routeIdValidation.isValid) {
            return sendError(res, 400, routeIdValidation.message);
        }

        const route = await getRouteById(Number(routeId));
        if (!route) {
            return sendError(res, 404, "Route not found");
        }

        const trips = await getTripsByRouteModel(Number(routeId));

        return sendSuccess(res, 200, "Trips fetched successfully", trips);
    } catch (error) {
        console.error("Fetch trips by route failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const updateTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const { route_id, vehicle_id, trip_date, departure_time, status } = req.body;

        const tripIdValidation = validatePositiveInteger(id, "Trip ID");
        if (!tripIdValidation.isValid) {
            return sendError(res, 400, tripIdValidation.message);
        }

        const { isValid } = validateRequiredFields(req.body, [
            "route_id",
            "vehicle_id",
            "trip_date",
            "departure_time",
            "status"
        ]);

        if (!isValid) {
            return sendError(res, 400, "Please fill all the required fields");
        }

        const routeValidation = validatePositiveInteger(route_id, "Route ID");
        if (!routeValidation.isValid) {
            return sendError(res, 400, routeValidation.message);
        }

        const vehicleValidation = validatePositiveInteger(vehicle_id, "Vehicle ID");
        if (!vehicleValidation.isValid) {
            return sendError(res, 400, vehicleValidation.message);
        }

        const tripDateValidation = validateTripDate(trip_date);
        if (!tripDateValidation.isValid) {
            return sendError(res, 400, tripDateValidation.message);
        }

        const departureTimeValidation = validateDepartureTime(departure_time);
        if (!departureTimeValidation.isValid) {
            return sendError(res, 400, departureTimeValidation.message);
        }

        const statusValidation = validateTripStatus(status);
        if (!statusValidation.isValid) {
            return sendError(res, 400, statusValidation.message);
        }

        const existingTrip = await getTripById(Number(id));
        if (!existingTrip) {
            return sendError(res, 404, "Trip not found");
        }

        const referenceValidation = await validateRouteAndVehicle(
            Number(route_id),
            Number(vehicle_id)
        );
        if (!referenceValidation.isValid) {
            return sendError(
                res,
                referenceValidation.statusCode,
                referenceValidation.message
            );
        }

        await updateTripModel(
            Number(id),
            Number(route_id),
            Number(vehicle_id),
            trip_date,
            departure_time,
            statusValidation.normalizedStatus
        );

        const updatedTrip = await getTripById(Number(id));

        return sendSuccess(res, 200, "Trip updated successfully", updatedTrip);
    } catch (error) {
        console.error("Update trip failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const deleteTrip = async (req, res) => {
    try {
        const { id } = req.params;

        const tripIdValidation = validatePositiveInteger(id, "Trip ID");
        if (!tripIdValidation.isValid) {
            return sendError(res, 400, tripIdValidation.message);
        }

        const existingTrip = await getTripById(Number(id));
        if (!existingTrip) {
            return sendError(res, 404, "Trip not found");
        }

        await deleteTripModel(Number(id));

        return sendSuccess(res, 200, "Trip deleted successfully", null);
    } catch (error) {
        console.error("Delete trip failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const startTrip = async (req, res) => {
    try {
        const { id } = req.params;

        const tripIdValidation = validatePositiveInteger(id, "Trip ID");
        if (!tripIdValidation.isValid) {
            return sendError(res, 400, tripIdValidation.message);
        }

        const trip = await getTripById(Number(id));
        if (!trip) {
            return sendError(res, 404, "Trip not found");
        }

        if (trip.driver_id !== req.user.id) {
            return sendError(res, 403, "Access denied for this trip");
        }

        if (trip.status !== "scheduled") {
            return sendError(res, 400, "Only scheduled trips can be started");
        }

        await startTripModel(Number(id));

        const now = new Date();
        const tripDate = new Date(`${trip.trip_date}T${trip.departure_time}`);
        const delayMs = now - tripDate;
        const delayMinutes = Math.floor(delayMs / (1000 * 60));

        if (delayMinutes >= 10) {
            try {
                await createPenalty(
                    req.user.id,
                    Number(id),
                    50,
                    `Late arrival by ${delayMinutes} minutes - Rs.50 penalty`
                );
            } catch (penaltyError) {
                console.error("Failed to create penalty: " + penaltyError);
            }
        }

        if (delayMinutes >= 5) {
            try {
                await createNotification(
                    req.user.id,
                    "Trip Late",
                    `Your trip #${id} is ${delayMinutes} minutes late. Scheduled departure was ${trip.departure_time}.`,
                    "delay"
                );
            } catch (notificationError) {
                console.error("Failed to create notification: " + notificationError);
            }
        }

        const updatedTrip = await getTripById(Number(id));

        return sendSuccess(res, 200, "Trip started successfully", updatedTrip);
    } catch (error) {
        console.error("Start trip failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const endTrip = async (req, res) => {
    try {
        const { id } = req.params;

        const tripIdValidation = validatePositiveInteger(id, "Trip ID");
        if (!tripIdValidation.isValid) {
            return sendError(res, 400, tripIdValidation.message);
        }

        const trip = await getTripById(Number(id));
        if (!trip) {
            return sendError(res, 404, "Trip not found");
        }

        if (trip.driver_id !== req.user.id) {
            return sendError(res, 403, "Access denied for this trip");
        }

        if (trip.status !== "ongoing") {
            return sendError(res, 400, "Only ongoing trips can be ended");
        }

        await endTripModel(Number(id));

        const updatedTrip = await getTripById(Number(id));

        return sendSuccess(res, 200, "Trip ended successfully", updatedTrip);
    } catch (error) {
        console.error("End trip failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};