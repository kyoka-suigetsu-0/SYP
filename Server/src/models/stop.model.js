import { db } from "../config/database.js";

export const createStop = async (
	route_id,
	stop_name,
	stop_order,
	arrival_offset_minutes
) => {
	const query = `
		INSERT INTO stops (route_id, stop_name, stop_order, arrival_offset_minutes)
		VALUES (?, ?, ?, ?)
	`;

	const [result] = await db.query(query, [
		route_id,
		stop_name,
		stop_order,
		arrival_offset_minutes
	]);

	return result;
};

export const getStopsByRoute = async (routeId) => {
	const query = `
		SELECT id, route_id, stop_name, stop_order, arrival_offset_minutes, created_at
		FROM stops
		WHERE route_id = ?
		ORDER BY stop_order ASC
	`;

	const [rows] = await db.query(query, [routeId]);

	return rows;
};

export const getStopById = async (id) => {
	const query = `
		SELECT id, route_id, stop_name, stop_order, arrival_offset_minutes, created_at
		FROM stops
		WHERE id = ?
	`;

	const [rows] = await db.query(query, [id]);

	return rows[0];
};

export const updateStop = async (id, stop_name, stop_order, arrival_offset_minutes) => {
	const query = `
		UPDATE stops
		SET stop_name = ?,
			stop_order = ?,
			arrival_offset_minutes = ?
		WHERE id = ?
	`;

	const [result] = await db.query(query, [
		stop_name,
		stop_order,
		arrival_offset_minutes,
		id
	]);

	return result;
};

export const deleteStop = async (id) => {
	const query = `
		DELETE FROM stops
		WHERE id = ?
	`;

	const [result] = await db.query(query, [id]);

	return result;
};
