import { sendError } from "../utils/reponseHandler.js";
import { verifyToken } from "../utils/jwtUtils.js";

export const verifyUser = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return sendError(res, 401, "No token provided")
    }

    const token = authHeader.split(" ")[1]

    try {

        const decoded = verifyToken(token);
        req.user = decoded;

        return next();


    } catch (error) {
        console.error("Verification failed: " + error)
        return sendError(res, 403, "Invalid token")
    }
}

export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return sendError(res, 401, "Unauthorized")
        }

        if (!req.user.role) {
            return sendError(res, 403, "No role found for this user")
        }

        const normalizedAllowedRoles = allowedRoles.map((role) =>
            String(role).toLowerCase().trim()
        );
        const userRole = String(req.user.role).toLowerCase().trim();

        if (!normalizedAllowedRoles.includes(userRole)) {
            return sendError(res, 403, "Access denied")
        }

        return next();
    };
};