import {
    createVehicle as createVehicleModel,
    deleteVehicle as deleteVehicleModel,
    getAllVehicles,
    getVehicleById,
    updateVehicle as updateVehicleModel
} from "../models/vehicle.model.js";
import { findUserById } from "../models/user.model.js";
import { sendError, sendSuccess } from "../utils/reponseHandler.js";
import { validateRequiredFields } from "../utils/validator.js";

const VEHICLE_STATUSES = ["active", "inactive", "maintenance"];

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

const normalizeDriverId = (driverId) => {
    if (driverId === undefined || driverId === null || driverId === "") {
        return null;
    }

    return Number(driverId);
};

const validateVehicleStatus = (status) => {
    if (!VEHICLE_STATUSES.includes(String(status).toLowerCase().trim())) {
        return {
            isValid: false,
            message: `Status must be one of: ${VEHICLE_STATUSES.join(", ")}`
        };
    }

    return { isValid: true };
};

const ensureDriverExists = async (driverId) => {
    if (driverId === null) {
        return { isValid: true };
    }

    const driverIdValidation = validatePositiveInteger(driverId, "Driver ID");
    if (!driverIdValidation.isValid) {
        return driverIdValidation;
    }

    const driver = await findUserById(driverId);
    if (!driver) {
        return {
            isValid: false,
            statusCode: 404,
            message: "Driver not found"
        };
    }

    return { isValid: true };
};

export const createVehicle = async (req, res) => {
    try {
        const { vehicle_number, vehicle_type, total_seats, driver_id } = req.body;

        const { isValid } = validateRequiredFields(req.body, [
            "vehicle_number",
            "total_seats"
        ]);

        if (!isValid) {
            return sendError(res, 400, "Please fill all the required fields");
        }

        const seatsValidation = validatePositiveInteger(total_seats, "Total seats");
        if (!seatsValidation.isValid) {
            return sendError(res, 400, seatsValidation.message);
        }

        const normalizedDriverId = normalizeDriverId(driver_id);
        const driverValidation = await ensureDriverExists(normalizedDriverId);
        if (!driverValidation.isValid) {
            return sendError(
                res,
                driverValidation.statusCode || 400,
                driverValidation.message
            );
        }

        const { insertId } = await createVehicleModel(
            vehicle_number,
            vehicle_type || null,
            Number(total_seats),
            normalizedDriverId
        );

        const vehicle = await getVehicleById(insertId);

        return sendSuccess(res, 201, "Vehicle created successfully", vehicle);
    } catch (error) {
        console.error("Create vehicle failed: " + error);

        if (error.code === "ER_DUP_ENTRY") {
            return sendError(res, 409, "Vehicle number already exists");
        }

        return sendError(res, 500, "Internal server error");
    }
};

export const getVehicles = async (req, res) => {
    try {
        const vehicles = await getAllVehicles();

        return sendSuccess(res, 200, "Vehicles fetched successfully", vehicles);
    } catch (error) {
        console.error("Fetch vehicles failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const getVehicle = async (req, res) => {
    try {
        const { id } = req.params;

        const vehicleIdValidation = validatePositiveInteger(id, "Vehicle ID");
        if (!vehicleIdValidation.isValid) {
            return sendError(res, 400, vehicleIdValidation.message);
        }

        const vehicle = await getVehicleById(Number(id));

        if (!vehicle) {
            return sendError(res, 404, "Vehicle not found");
        }

        return sendSuccess(res, 200, "Vehicle fetched successfully", vehicle);
    } catch (error) {
        console.error("Fetch vehicle failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const { vehicle_number, vehicle_type, total_seats, driver_id, status } = req.body;

        const vehicleIdValidation = validatePositiveInteger(id, "Vehicle ID");
        if (!vehicleIdValidation.isValid) {
            return sendError(res, 400, vehicleIdValidation.message);
        }

        const { isValid } = validateRequiredFields(req.body, [
            "vehicle_number",
            "total_seats",
            "status"
        ]);

        if (!isValid) {
            return sendError(res, 400, "Please fill all the required fields");
        }

        const seatsValidation = validatePositiveInteger(total_seats, "Total seats");
        if (!seatsValidation.isValid) {
            return sendError(res, 400, seatsValidation.message);
        }

        const statusValidation = validateVehicleStatus(status);
        if (!statusValidation.isValid) {
            return sendError(res, 400, statusValidation.message);
        }

        const existingVehicle = await getVehicleById(Number(id));
        if (!existingVehicle) {
            return sendError(res, 404, "Vehicle not found");
        }

        const normalizedDriverId = normalizeDriverId(driver_id);
        const driverValidation = await ensureDriverExists(normalizedDriverId);
        if (!driverValidation.isValid) {
            return sendError(
                res,
                driverValidation.statusCode || 400,
                driverValidation.message
            );
        }

        await updateVehicleModel(
            Number(id),
            vehicle_number,
            vehicle_type || null,
            Number(total_seats),
            normalizedDriverId,
            String(status).toLowerCase().trim()
        );

        const updatedVehicle = await getVehicleById(Number(id));

        return sendSuccess(res, 200, "Vehicle updated successfully", updatedVehicle);
    } catch (error) {
        console.error("Update vehicle failed: " + error);

        if (error.code === "ER_DUP_ENTRY") {
            return sendError(res, 409, "Vehicle number already exists");
        }

        return sendError(res, 500, "Internal server error");
    }
};

export const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;

        const vehicleIdValidation = validatePositiveInteger(id, "Vehicle ID");
        if (!vehicleIdValidation.isValid) {
            return sendError(res, 400, vehicleIdValidation.message);
        }

        const existingVehicle = await getVehicleById(Number(id));
        if (!existingVehicle) {
            return sendError(res, 404, "Vehicle not found");
        }

        await deleteVehicleModel(Number(id));

        return sendSuccess(res, 200, "Vehicle deleted successfully", null);
    } catch (error) {
        console.error("Delete vehicle failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};