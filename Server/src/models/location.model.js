import { db } from "../config/database.js";

export const updateVehicleLocation = async (vehicle_id, latitude, longitude) => {
	const existingQuery = `
		SELECT id
		FROM locations
		WHERE vehicle_id = ?
		ORDER BY updated_at DESC, id DESC
		LIMIT 1
	`;

	const [existingRows] = await db.query(existingQuery, [vehicle_id]);

	if (existingRows.length > 0) {
		const query = `
			UPDATE locations
			SET latitude = ?,
				longitude = ?
			WHERE id = ?
		`;

		const [result] = await db.query(query, [
			latitude,
			longitude,
			existingRows[0].id
		]);

		return result;
	}

	const query = `
		INSERT INTO locations (vehicle_id, latitude, longitude)
		VALUES (?, ?, ?)
	`;

	const [result] = await db.query(query, [vehicle_id, latitude, longitude]);

	return result;
};

export const getVehicleLocation = async (vehicleId) => {
	const query = `
		SELECT l.id,
			l.vehicle_id,
			v.vehicle_number,
			v.vehicle_type,
			v.driver_id,
			l.latitude,
			l.longitude,
			l.updated_at
		FROM locations l
		INNER JOIN vehicles v ON l.vehicle_id = v.id
		WHERE l.vehicle_id = ?
		ORDER BY l.updated_at DESC, l.id DESC
		LIMIT 1
	`;

	const [rows] = await db.query(query, [vehicleId]);

	return rows[0];
};

export const getAllVehicleLocations = async () => {
	const query = `
		SELECT l.id,
			l.vehicle_id,
			v.vehicle_number,
			v.vehicle_type,
			v.driver_id,
			l.latitude,
			l.longitude,
			l.updated_at
		FROM locations l
		INNER JOIN vehicles v ON l.vehicle_id = v.id
		INNER JOIN (
			SELECT vehicle_id, MAX(updated_at) AS latest_updated_at
			FROM locations
			GROUP BY vehicle_id
		) latest ON latest.vehicle_id = l.vehicle_id AND latest.latest_updated_at = l.updated_at
		ORDER BY l.updated_at DESC, l.id DESC
	`;

	const [rows] = await db.query(query);

	return rows;
};
