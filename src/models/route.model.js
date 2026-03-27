import { db } from "../config/database.js";

export const createRoute = async (
	route_name,
	start_location,
	end_location,
	distance_km,
	estimated_time
) => {
	const query = `
		INSERT INTO routes (route_name, start_location, end_location, distance_km, estimated_time)
		VALUES (?, ?, ?, ?, ?)
	`;

	const [result] = await db.query(query, [
		route_name,
		start_location,
		end_location,
		distance_km,
		estimated_time
	]);

	return result;
};

export const getAllRoutes = async () => {
	const query = `
		SELECT id, route_name, start_location, end_location, distance_km, estimated_time, created_at
		FROM routes
		ORDER BY id 
	`;

	const [rows] = await db.query(query);

	return rows;
};

export const getRouteById = async (id) => {
	const query = `
		SELECT id, route_name, start_location, end_location, distance_km, estimated_time, created_at
		FROM routes
		WHERE id = ?
	`;

	const [rows] = await db.query(query, [id]);

	return rows[0];
};

export const updateRoute = async (
	id,
	route_name,
	start_location,
	end_location,
	distance_km,
	estimated_time
) => {
	const query = `
		UPDATE routes
		SET route_name = ?,
			start_location = ?,
			end_location = ?,
			distance_km = ?,
			estimated_time = ?
		WHERE id = ?
	`;

	const [result] = await db.query(query, [
		route_name,
		start_location,
		end_location,
		distance_km,
		estimated_time,
		id
	]);

	return result;
};

export const deleteRoute = async (id) => {
	const query = `
		DELETE FROM routes
		WHERE id = ?
	`;

	const [result] = await db.query(query, [id]);

	return result;
};
