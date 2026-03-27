import { db } from "../config/database.js";

export const createTrip = async (
	route_id,
	vehicle_id,
	trip_date,
	departure_time
) => {
	const query = `
		INSERT INTO trips (route_id, vehicle_id, trip_date, departure_time)
		VALUES (?, ?, ?, ?)
	`;

	const [result] = await db.query(query, [
		route_id,
		vehicle_id,
		trip_date,
		departure_time
	]);

	return result;
};

export const getAllTrips = async () => {
	const query = `
		SELECT t.id,
			t.route_id,
			r.route_name,
			t.vehicle_id,
			v.vehicle_number,
			v.vehicle_type,
			v.total_seats,
			v.driver_id,
			t.trip_date,
			t.departure_time,
			t.status,
			t.created_at
		FROM trips t
		INNER JOIN routes r ON t.route_id = r.id
		INNER JOIN vehicles v ON t.vehicle_id = v.id
		ORDER BY t.trip_date DESC, t.departure_time DESC, t.id DESC
	`;

	const [rows] = await db.query(query);

	return rows;
};

export const getTripById = async (id) => {
	const query = `
		SELECT t.id,
			t.route_id,
			r.route_name,
			t.vehicle_id,
			v.vehicle_number,
			v.vehicle_type,
			v.total_seats,
			v.driver_id,
			t.trip_date,
			t.departure_time,
			t.status,
			t.created_at
		FROM trips t
		INNER JOIN routes r ON t.route_id = r.id
		INNER JOIN vehicles v ON t.vehicle_id = v.id
		WHERE t.id = ?
	`;

	const [rows] = await db.query(query, [id]);

	return rows[0];
};

export const getTripsByRoute = async (routeId) => {
	const query = `
		SELECT t.id,
			t.route_id,
			r.route_name,
			t.vehicle_id,
			v.vehicle_number,
			v.vehicle_type,
			v.total_seats,
			v.driver_id,
			t.trip_date,
			t.departure_time,
			t.status,
			t.created_at
		FROM trips t
		INNER JOIN routes r ON t.route_id = r.id
		INNER JOIN vehicles v ON t.vehicle_id = v.id
		WHERE t.route_id = ?
		ORDER BY t.trip_date DESC, t.departure_time DESC, t.id DESC
	`;

	const [rows] = await db.query(query, [routeId]);

	return rows;
};

export const updateTrip = async (
	id,
	route_id,
	vehicle_id,
	trip_date,
	departure_time,
	status
) => {
	const query = `
		UPDATE trips
		SET route_id = ?,
			vehicle_id = ?,
			trip_date = ?,
			departure_time = ?,
			status = ?
		WHERE id = ?
	`;

	const [result] = await db.query(query, [
		route_id,
		vehicle_id,
		trip_date,
		departure_time,
		status,
		id
	]);

	return result;
};

export const deleteTrip = async (id) => {
	const query = `
		DELETE FROM trips
		WHERE id = ?
	`;

	const [result] = await db.query(query, [id]);

	return result;
};

export const startTrip = async (id) => {
	const query = `
		UPDATE trips
		SET status = 'ongoing'
		WHERE id = ?
	`;

	const [result] = await db.query(query, [id]);

	return result;
};

export const endTrip = async (id) => {
	const query = `
		UPDATE trips
		SET status = 'completed'
		WHERE id = ?
	`;

	const [result] = await db.query(query, [id]);

	return result;
};
