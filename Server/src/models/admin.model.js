import { db } from "../config/database.js";

export const getTotalTrips = async () => {
	const query = `
		SELECT COUNT(*) as total
		FROM trips
	`;

	const [rows] = await db.query(query);

	return rows[0]?.total || 0;
};

export const getTotalBookings = async () => {
	const query = `
		SELECT COUNT(*) as total
		FROM bookings
	`;

	const [rows] = await db.query(query);

	return rows[0]?.total || 0;
};

export const getTotalRevenue = async () => {
	const query = `
		SELECT COALESCE(SUM(amount), 0) as total
		FROM payments
		WHERE status = 'completed'
	`;

	const [rows] = await db.query(query);

	return rows[0]?.total || 0;
};

export const getTotalPenalties = async () => {
	const query = `
		SELECT COALESCE(SUM(amount), 0) as total
		FROM penalties
	`;

	const [rows] = await db.query(query);

	return rows[0]?.total || 0;
};

export const getTotalEmergencyReports = async () => {
	const query = `
		SELECT COUNT(*) as total
		FROM emergency_reports
	`;

	const [rows] = await db.query(query);

	return rows[0]?.total || 0;
};
