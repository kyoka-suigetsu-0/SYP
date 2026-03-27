import {
	getTotalBookings,
	getTotalEmergencyReports,
	getTotalPenalties,
	getTotalRevenue,
	getTotalTrips
} from "../models/admin.model.js";
import { sendError, sendSuccess } from "../utils/reponseHandler.js";

export const getStats = async (req, res) => {
	try {
		const [totalTrips, totalBookings, totalRevenue, totalPenalties, totalEmergencyReports] = await Promise.all([
			getTotalTrips(),
			getTotalBookings(),
			getTotalRevenue(),
			getTotalPenalties(),
			getTotalEmergencyReports()
		]);

		const stats = {
			totalTrips,
			totalBookings,
			totalRevenue: Number(totalRevenue),
			totalPenalties: Number(totalPenalties),
			totalEmergencyReports
		};

		return sendSuccess(res, 200, "Admin stats fetched successfully", stats);
	} catch (error) {
		console.error("Fetch admin stats failed: " + error);
		return sendError(res, 500, "Internal server error");
	}
};
