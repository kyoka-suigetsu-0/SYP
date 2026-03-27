import { findUserById } from "../models/user.model.js";
import {
    createNotification as createNotificationModel,
    getAllNotifications as getAllNotificationsModel,
    getNotificationById,
    getNotificationsByUser as getNotificationsByUserModel,
    markAsRead as markAsReadModel
} from "../models/notification.model.js";
import { sendError, sendSuccess } from "../utils/reponseHandler.js";
import { validateRequiredFields } from "../utils/validator.js";

const ALLOWED_NOTIFICATION_TYPES = ["general", "delay", "emergency", "trip"];

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

const normalizeNotificationType = (type) => {
    if (!type) {
        return "general";
    }

    return String(type).trim().toLowerCase();
};

const normalizeNullableUserId = (value) => {
    if (value === undefined || value === null || value === "") {
        return null;
    }

    return Number(value);
};

export const createNotification = async (req, res) => {
    try {
        const { user_id, title, message, type } = req.body;

        const { isValid } = validateRequiredFields(req.body, ["message"]);
        if (!isValid) {
            return sendError(res, 400, "Please fill all the required fields");
        }

        const normalizedUserId = normalizeNullableUserId(user_id);
        if (normalizedUserId !== null) {
            const userIdValidation = validatePositiveInteger(normalizedUserId, "User ID");
            if (!userIdValidation.isValid) {
                return sendError(res, 400, userIdValidation.message);
            }

            const user = await findUserById(normalizedUserId);
            if (!user) {
                return sendError(res, 404, "User not found");
            }
        }

        const normalizedType = normalizeNotificationType(type);
        if (!ALLOWED_NOTIFICATION_TYPES.includes(normalizedType)) {
            return sendError(res, 400, "Notification type is invalid");
        }

        const notification = await createNotificationModel(
            normalizedUserId,
            title,
            message,
            normalizedType
        );

        return sendSuccess(res, 201, "Notification created successfully", notification);
    } catch (error) {
        console.error("Create notification failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await getNotificationsByUserModel(req.user.id);

        return sendSuccess(res, 200, "Notifications fetched successfully", notifications);
    } catch (error) {
        console.error("Fetch my notifications failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const idValidation = validatePositiveInteger(id, "Notification ID");
        if (!idValidation.isValid) {
            return sendError(res, 400, idValidation.message);
        }

        const notification = await getNotificationById(Number(id));
        if (!notification) {
            return sendError(res, 404, "Notification not found");
        }

        const userRole = String(req.user.role || "").toLowerCase().trim();
        const isAdmin = userRole === "admin";

        if (!isAdmin && Number(notification.user_id) !== Number(req.user.id)) {
            return sendError(res, 403, "Access denied for this notification");
        }

        await markAsReadModel(Number(id));

        const updatedNotification = await getNotificationById(Number(id));

        return sendSuccess(
            res,
            200,
            "Notification marked as read",
            updatedNotification || null
        );
    } catch (error) {
        console.error("Mark notification as read failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};

export const getAllNotifications = async (req, res) => {
    try {
        const notifications = await getAllNotificationsModel();

        return sendSuccess(res, 200, "Notifications fetched successfully", notifications);
    } catch (error) {
        console.error("Fetch all notifications failed: " + error);
        return sendError(res, 500, "Internal server error");
    }
};
