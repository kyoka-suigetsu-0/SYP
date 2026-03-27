import { db } from "../config/database.js";

const BOOKING_STATUS_FALLBACK_ERROR_CODES = new Set([
	"ER_TRUNCATED_WRONG_VALUE",
	"ER_WARN_DATA_OUT_OF_RANGE",
	"WARN_DATA_TRUNCATED",
	"ER_CHECK_CONSTRAINT_VIOLATED"
]);

const createModelError = (statusCode, message) => {
	const error = new Error(message);
	error.statusCode = statusCode;
	return error;
};

const updateBookingStatusAfterPayment = async (connection, bookingId) => {
	try {
		await connection.query(
			`
				UPDATE bookings
				SET status = 'paid'
				WHERE id = ?
			`,
			[bookingId]
		);
	} catch (error) {
		if (!BOOKING_STATUS_FALLBACK_ERROR_CODES.has(error.code)) {
			throw error;
		}

		await connection.query(
			`
				UPDATE bookings
				SET status = 'completed'
				WHERE id = ?
			`,
			[bookingId]
		);
	}
};

export const createPayment = async (booking_id, amount, payment_method = "QR") => {
	const connection = await db.getConnection();

	try {
		await connection.beginTransaction();

		const [bookingRows] = await connection.query(
			`
				SELECT id, status
				FROM bookings
				WHERE id = ?
				FOR UPDATE
			`,
			[booking_id]
		);

		const booking = bookingRows[0];

		if (!booking) {
			throw createModelError(404, "Booking not found");
		}

		if (booking.status === "cancelled") {
			throw createModelError(400, "Cancelled bookings cannot be paid");
		}

		const [existingPaymentRows] = await connection.query(
			`
				SELECT id, status
				FROM payments
				WHERE booking_id = ?
				ORDER BY created_at DESC, id DESC
				LIMIT 1
			`,
			[booking_id]
		);

		const existingPayment = existingPaymentRows[0];

		if (
			existingPayment &&
			["pending", "completed"].includes(String(existingPayment.status).toLowerCase())
		) {
			throw createModelError(409, "Payment already exists for this booking");
		}

		const [result] = await connection.query(
			`
				INSERT INTO payments (booking_id, amount, payment_method)
				VALUES (?, ?, ?)
			`,
			[booking_id, amount, payment_method]
		);

		await updateBookingStatusAfterPayment(connection, booking_id);

		const [paymentRows] = await connection.query(
			`
				SELECT id,
					booking_id,
					amount,
					payment_method,
					status,
					created_at
				FROM payments
				WHERE id = ?
			`,
			[result.insertId]
		);

		await connection.commit();

		return paymentRows[0];
	} catch (error) {
		await connection.rollback();
		throw error;
	} finally {
		connection.release();
	}
};

export const getPaymentsByUser = async (userId) => {
	const query = `
		SELECT p.id,
			p.booking_id,
			p.amount,
			p.payment_method,
			p.status,
			p.created_at,
			b.trip_id,
			b.seat_number,
			b.status AS booking_status
		FROM payments p
		INNER JOIN bookings b ON p.booking_id = b.id
		WHERE b.user_id = ?
		ORDER BY p.created_at DESC, p.id DESC
	`;

	const [rows] = await db.query(query, [userId]);

	return rows;
};

export const getPaymentByBooking = async (bookingId) => {
	const query = `
		SELECT p.id,
			p.booking_id,
			p.amount,
			p.payment_method,
			p.status,
			p.created_at,
			b.user_id,
			b.trip_id,
			b.seat_number,
			b.status AS booking_status
		FROM payments p
		INNER JOIN bookings b ON p.booking_id = b.id
		WHERE p.booking_id = ?
		ORDER BY p.created_at DESC, p.id DESC
		LIMIT 1
	`;

	const [rows] = await db.query(query, [bookingId]);

	return rows[0];
};

export const getAllPayments = async () => {
	const query = `
		SELECT p.id,
			p.booking_id,
			p.amount,
			p.payment_method,
			p.status,
			p.created_at,
			b.user_id,
			u.name AS user_name,
			u.email AS user_email,
			b.trip_id,
			b.seat_number,
			b.status AS booking_status
		FROM payments p
		INNER JOIN bookings b ON p.booking_id = b.id
		INNER JOIN users u ON b.user_id = u.id
		ORDER BY p.created_at DESC, p.id DESC
	`;

	const [rows] = await db.query(query);

	return rows;
};
