import { db } from "../config/database.js";

export const createVehicle = async (
	vehicle_number,
	vehicle_type,
	total_seats,
	driver_id
) => {
	const query = `
		INSERT INTO vehicles (vehicle_number, vehicle_type, total_seats, driver_id)
		VALUES (?, ?, ?, ?)
	`;

	const [result] = await db.query(query, [
		vehicle_number,
		vehicle_type,
		total_seats,
		driver_id
	]);

	return result;
};

export const getAllVehicles = async () => {
	const query = `
		SELECT v.id,
			v.vehicle_number,
			v.vehicle_type,
			v.total_seats,
			v.driver_id,
			v.status,
			v.created_at,
			u.name AS driver_name,
			u.email AS driver_email,
			u.phone AS driver_phone
		FROM vehicles v
		LEFT JOIN users u ON v.driver_id = u.id
		ORDER BY v.id
	`;

	const [rows] = await db.query(query);

	return rows;
};

export const getVehicleById = async (id) => {
	const query = `
		SELECT v.id,
			v.vehicle_number,
			v.vehicle_type,
			v.total_seats,
			v.driver_id,
			v.status,
			v.created_at,
			u.name AS driver_name,
			u.email AS driver_email,
			u.phone AS driver_phone
		FROM vehicles v
		LEFT JOIN users u ON v.driver_id = u.id
		WHERE v.id = ?
	`;

	const [rows] = await db.query(query, [id]);

	return rows[0];
};

export const updateVehicle = async (
	id,
	vehicle_number,
	vehicle_type,
	total_seats,
	driver_id,
	status
) => {
	const query = `
		UPDATE vehicles
		SET vehicle_number = ?,
			vehicle_type = ?,
			total_seats = ?,
			driver_id = ?,
			status = ?
		WHERE id = ?
	`;

	const [result] = await db.query(query, [
		vehicle_number,
		vehicle_type,
		total_seats,
		driver_id,
		status,
		id
	]);

	return result;
};

export const deleteVehicle = async (id) => {
	const query = `
		DELETE FROM vehicles
		WHERE id = ?
	`;

	const [result] = await db.query(query, [id]);

	return result;
};
