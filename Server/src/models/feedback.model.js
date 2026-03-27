import { db } from "../config/database.js";

export const createFeedback = async (user_id, trip_id, rating, comment) => {
	const query = `
		INSERT INTO feedback (user_id, trip_id, rating, comment)
		VALUES (?, ?, ?, ?)
	`;

	const [result] = await db.query(query, [user_id, trip_id, rating, comment ?? null]);

	const [rows] = await db.query(
		`
			SELECT id,
				user_id,
				trip_id,
				rating,
				comment,
				created_at
			FROM feedback
			WHERE id = ?
		`,
		[result.insertId]
	);

	return rows[0];
};

export const getFeedbackByTrip = async (tripId) => {
	const query = `
		SELECT f.id,
			f.user_id,
			u.name AS user_name,
			u.email AS user_email,
			f.trip_id,
			f.rating,
			f.comment,
			f.created_at
		FROM feedback f
		INNER JOIN users u ON f.user_id = u.id
		WHERE f.trip_id = ?
		ORDER BY f.created_at DESC, f.id DESC
	`;

	const [rows] = await db.query(query, [tripId]);

	return rows;
};

export const getFeedbackByUser = async (userId) => {
	const query = `
		SELECT f.id,
			f.user_id,
			f.trip_id,
			t.trip_date,
			t.departure_time,
			r.route_name,
			f.rating,
			f.comment,
			f.created_at
		FROM feedback f
		INNER JOIN trips t ON f.trip_id = t.id
		INNER JOIN routes r ON t.route_id = r.id
		WHERE f.user_id = ?
		ORDER BY f.created_at DESC, f.id DESC
	`;

	const [rows] = await db.query(query, [userId]);

	return rows;
};

export const getFeedbackById = async (id) => {
	const query = `
		SELECT id,
			user_id,
			trip_id,
			rating,
			comment,
			created_at
		FROM feedback
		WHERE id = ?
	`;

	const [rows] = await db.query(query, [id]);

	return rows[0];
};

export const deleteFeedback = async (id) => {
	const query = `
		DELETE FROM feedback
		WHERE id = ?
	`;

	const [result] = await db.query(query, [id]);

	return result;
};
