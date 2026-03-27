import { db } from "../config/database.js";

export const createNotification = async (user_id, title, message, type = "general") => {
	const query = `
		INSERT INTO notifications (user_id, title, message, type)
		VALUES (?, ?, ?, ?)
	`;

	const [result] = await db.query(query, [
		user_id ?? null,
		title ?? null,
		message,
		type
	]);

	const [rows] = await db.query(
		`
			SELECT id,
				user_id,
				title,
				message,
				type,
				is_read,
				created_at
			FROM notifications
			WHERE id = ?
		`,
		[result.insertId]
	);

	return rows[0];
};

export const getNotificationsByUser = async (userId) => {
	const query = `
		SELECT id,
			user_id,
			title,
			message,
			type,
			is_read,
			created_at
		FROM notifications
		WHERE user_id = ?
		ORDER BY created_at DESC, id DESC
	`;

	const [rows] = await db.query(query, [userId]);

	return rows;
};

export const markAsRead = async (id) => {
	const [result] = await db.query(
		`
			UPDATE notifications
			SET is_read = TRUE
			WHERE id = ?
		`,
		[id]
	);

	return result;
};

export const getNotificationById = async (id) => {
	const [rows] = await db.query(
		`
			SELECT id,
				user_id,
				title,
				message,
				type,
				is_read,
				created_at
			FROM notifications
			WHERE id = ?
		`,
		[id]
	);

	return rows[0];
};

export const getAllNotifications = async () => {
	const query = `
		SELECT n.id,
			n.user_id,
			u.name AS user_name,
			u.email AS user_email,
			n.title,
			n.message,
			n.type,
			n.is_read,
			n.created_at
		FROM notifications n
		LEFT JOIN users u ON n.user_id = u.id
		ORDER BY n.created_at DESC, n.id DESC
	`;

	const [rows] = await db.query(query);

	return rows;
};
