import {
    getAllVehicleLocations,
    getVehicleLocation as getVehicleLocationModel,
    updateVehicleLocation as updateVehicleLocationModel
} from "../models/location.model.js";
import { getVehicleById } from "../models/vehicle.model.js";
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

const validateLatitude = (value) => {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
        return {
            isValid: false,
            message: "Latitude must be a valid number"
        };
    }

    if (numericValue < -90 || numericValue > 90) {
        return {
            isValid: false,
            message: "Latitude must be between -90 and 90"
        };
    }

    return { isValid: true, numericValue };
};

const validateLongitude = (value) => {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
        return {
            isValid: false,
            message: "Longitude must be a valid number"
        };
    }

    if (numericValue < -180 || numericValue > 180) {
        return {
            isValid: false,
            message: "Longitude must be between -180 and 180"
        };
    }

    return { isValid: true, numericValue };
};

export const updateLocation = async (req, res) => {
    try {
        const { vehicle_id, latitude, longitude } = req.body;

        const { isValid } = validateRequiredFields(req.body, [
            "vehicle_id",
            "latitude",
            "longitude"
        ]);

        if (!isValid) {
            return sendError(res, 400, "Please fill all the required fields");
        }

        const vehicleIdValidation = validatePositiveInteger(vehicle_id, "Vehicle ID");
        if (!vehicleIdValidation.isValid) {
            return sendError(res, 400, vehicleIdValidation.message);
        }

        const latitudeValidation = validateLatitude(latitude);
        if (!latitudeValidation.isValid) {
            return sendError(res, 400, latitudeValidation.message);
        }

        const longitudeValidation = validateLongitude(longitude);
        if (!longitudeValidation.isValid) {
            return sendError(res, 400, longitudeValidation.message);
        }

        const vehicle = await getVehicleById(Number(vehicle_id));
        if (!vehicle) {
            return sendError(res, 404, "Vehicle not found");
        }

        if (Number(vehicle.driver_id) !== Number(req.user.id)) {
            return sendError(res, 403, "Access denied for this vehicle");
        }

        await updateVehicleLocationModel(
            Number(vehicle_id),
            latitudeValidation.numericValue,
            longitudeValidation.numericValue
        );

        const location = await getVehicleLocationModel(Number(vehicle_id));

        return sendSuccess(res, 200, "Vehicle location updated successfully", location);
    } catch (error) {
        console.error("Update vehicle location failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const getVehicleLocation = async (req, res) => {
    try {
        const { vehicleId } = req.params;

        const vehicleIdValidation = validatePositiveInteger(vehicleId, "Vehicle ID");
        if (!vehicleIdValidation.isValid) {
            return sendError(res, 400, vehicleIdValidation.message);
        }

        const vehicle = await getVehicleById(Number(vehicleId));
        if (!vehicle) {
            return sendError(res, 404, "Vehicle not found");
        }

        const location = await getVehicleLocationModel(Number(vehicleId));

        if (!location) {
            return sendError(res, 404, "Vehicle location not found");
        }

        return sendSuccess(res, 200, "Vehicle location fetched successfully", location);
    } catch (error) {
        console.error("Fetch vehicle location failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const getAllLocations = async (req, res) => {
    try {
        const locations = await getAllVehicleLocations();

        return sendSuccess(res, 200, "Vehicle locations fetched successfully", locations);
    } catch (error) {
        console.error("Fetch all vehicle locations failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};