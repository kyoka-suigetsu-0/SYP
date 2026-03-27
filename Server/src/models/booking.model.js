import { db } from "../config/database.js";

export const createBooking = async (
	user_id,
	trip_id,
	seat_number,
	boarding_stop_id
) => {
	const query = `
		INSERT INTO bookings (user_id, trip_id, seat_number, boarding_stop_id)
		VALUES (?, ?, ?, ?)
	`;

	const [result] = await db.query(query, [
		user_id,
		trip_id,
		seat_number,
		boarding_stop_id
	]);

	return result;
};

export const getBookingsByUser = async (userId) => {
	const query = `
		SELECT b.id,
			b.user_id,
			b.trip_id,
			b.seat_number,
			b.boarding_stop_id,
			b.status,
			b.created_at,
			t.trip_date,
			t.departure_time,
			t.status AS trip_status,
			r.id AS route_id,
			r.route_name,
			v.id AS vehicle_id,
			v.vehicle_number,
			s.stop_name AS boarding_stop_name
		FROM bookings b
		INNER JOIN trips t ON b.trip_id = t.id
		INNER JOIN routes r ON t.route_id = r.id
		INNER JOIN vehicles v ON t.vehicle_id = v.id
		LEFT JOIN stops s ON b.boarding_stop_id = s.id
		WHERE b.user_id = ?
		ORDER BY b.created_at DESC, b.id DESC
	`;

	const [rows] = await db.query(query, [userId]);

	return rows;
};

export const getBookingsByTrip = async (tripId) => {
	const query = `
		SELECT b.id,
			b.user_id,
			u.name AS user_name,
			u.email AS user_email,
			u.phone AS user_phone,
			b.trip_id,
			b.seat_number,
			b.boarding_stop_id,
			b.status,
			b.created_at,
			t.trip_date,
			t.departure_time,
			t.status AS trip_status,
			r.id AS route_id,
			r.route_name,
			v.id AS vehicle_id,
			v.vehicle_number,
			v.driver_id,
			s.stop_name AS boarding_stop_name
		FROM bookings b
		INNER JOIN users u ON b.user_id = u.id
		INNER JOIN trips t ON b.trip_id = t.id
		INNER JOIN routes r ON t.route_id = r.id
		INNER JOIN vehicles v ON t.vehicle_id = v.id
		LEFT JOIN stops s ON b.boarding_stop_id = s.id
		WHERE b.trip_id = ?
		ORDER BY b.seat_number ASC, b.id ASC
	`;

	const [rows] = await db.query(query, [tripId]);

	return rows;
};

export const getBookedSeats = async (tripId) => {
	const query = `
		SELECT seat_number
		FROM bookings
		WHERE trip_id = ? AND status = 'booked'
		ORDER BY seat_number ASC
	`;

	const [rows] = await db.query(query, [tripId]);

	return rows;
};

export const getBookingById = async (id) => {
	const query = `
		SELECT b.id,
			b.user_id,
			b.trip_id,
			b.seat_number,
			b.boarding_stop_id,
			b.status,
			b.created_at,
			t.route_id,
			v.driver_id,
			v.total_seats,
			t.status AS trip_status
		FROM bookings b
		INNER JOIN trips t ON b.trip_id = t.id
		INNER JOIN vehicles v ON t.vehicle_id = v.id
		WHERE b.id = ?
	`;

	const [rows] = await db.query(query, [id]);

	return rows[0];
};

export const cancelBooking = async (id) => {
	const query = `
		UPDATE bookings
		SET status = 'cancelled'
		WHERE id = ?
	`;

	const [result] = await db.query(query, [id]);

	return result;
};
