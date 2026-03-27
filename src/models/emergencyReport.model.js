import { db } from "../config/database.js";

export const createEmergencyReport = async (trip_id, driver_id, message) => {
	const query = `
		INSERT INTO emergency_reports (trip_id, driver_id, message)
		VALUES (?, ?, ?)
	`;

	const [result] = await db.query(query, [
		trip_id ?? null,
		driver_id,
		message
	]);

	const [rows] = await db.query(
		`
			SELECT id,
				trip_id,
				driver_id,
				message,
				status,
				created_at
			FROM emergency_reports
			WHERE id = ?
		`,
		[result.insertId]
	);

	return rows[0];
};

export const getAllReports = async () => {
	const query = `
		SELECT er.id,
			er.trip_id,
			er.driver_id,
			u.name AS driver_name,
			u.email AS driver_email,
			er.message,
			er.status,
			er.created_at,
			t.trip_date,
			t.departure_time,
			r.route_name
		FROM emergency_reports er
		INNER JOIN users u ON er.driver_id = u.id
		LEFT JOIN trips t ON er.trip_id = t.id
		LEFT JOIN routes r ON t.route_id = r.id
		ORDER BY er.created_at DESC, er.id DESC
	`;

	const [rows] = await db.query(query);

	return rows;
};

export const getReportById = async (id) => {
	const query = `
		SELECT id,
			trip_id,
			driver_id,
			message,
			status,
			created_at
		FROM emergency_reports
		WHERE id = ?
	`;

	const [rows] = await db.query(query, [id]);

	return rows[0];
};

export const resolveReport = async (id) => {
	const query = `
		UPDATE emergency_reports
		SET status = 'resolved'
		WHERE id = ?
	`;

	const [result] = await db.query(query, [id]);

	return result;
};
