import { db } from "../config/database.js";

export const createPenalty = async (user_id_or_driver_id, trip_id, amount, reason) => {
	// Support both driver penalties (pass driver_id as first arg) and passenger penalties (pass user_id as first arg)
	// When trip_id is null, treat user_id_or_driver_id as user_id for passenger penalties
	// When trip_id is not null, treat user_id_or_driver_id as driver_id for driver penalties
	
	const driver_id = trip_id !== null && trip_id !== undefined ? user_id_or_driver_id : null;
	const user_id = trip_id === null || trip_id === undefined ? user_id_or_driver_id : null;

	const query = `
		INSERT INTO penalties (user_id, driver_id, trip_id, amount, reason)
		VALUES (?, ?, ?, ?, ?)
	`;

	const [result] = await db.query(query, [user_id, driver_id, trip_id ?? null, amount, reason]);

	const [rows] = await db.query(
		`
			SELECT id,
				user_id,
				driver_id,
				trip_id,
				amount,
				reason,
				created_at
			FROM penalties
			WHERE id = ?
		`,
		[result.insertId]
	);

	return rows[0];
};

export const getPenaltiesByDriver = async (driverId) => {
	const query = `
		SELECT id,
			driver_id,
			trip_id,
			amount,
			reason,
			created_at
		FROM penalties
		WHERE driver_id = ?
		ORDER BY created_at DESC, id DESC
	`;

	const [rows] = await db.query(query, [driverId]);

	return rows;
};

export const getAllPenalties = async () => {
	const query = `
		SELECT p.id,
			p.driver_id,
			u.name AS driver_name,
			u.email AS driver_email,
			p.trip_id,
			p.amount,
			p.reason,
			p.created_at
		FROM penalties p
		INNER JOIN users u ON p.driver_id = u.id
		ORDER BY p.created_at DESC, p.id DESC
	`;

	const [rows] = await db.query(query);

	return rows;
};
