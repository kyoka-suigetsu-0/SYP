const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
	const raw = localStorage.getItem(USER_KEY);
	if (!raw) return null;

	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
};

export const setAuthSession = ({ token, user }) => {
	if (token) {
		localStorage.setItem(TOKEN_KEY, token);
	}

	if (user) {
		localStorage.setItem(USER_KEY, JSON.stringify(user));
	}
};

export const clearAuthSession = () => {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_KEY);
};

const request = async (path, options = {}) => {
	const { requiresAuth = false, method = "GET", body } = options;
	const headers = { "Content-Type": "application/json" };

	if (requiresAuth) {
		const token = getAuthToken();
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}
	}

	const response = await fetch(`${API_BASE_URL}${path}`, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	});

	const text = await response.text();
	let payload = null;

	if (text) {
		try {
			payload = JSON.parse(text);
		} catch {
			payload = null;
		}
	}

	if (!response.ok || payload?.success === false) {
		const error = new Error(payload?.message || "Request failed");
		error.status = response.status;
		error.payload = payload;
		throw error;
	}

	return payload;
};

export const authApi = {
	register: (input) => request("/auth/register", { method: "POST", body: input }),
	login: (input) => request("/auth/login", { method: "POST", body: input }),
	getProfile: () => request("/auth/profile", { method: "POST", requiresAuth: true }),
};

export const bookingApi = {
	getMyBookings: () => request("/bookings/my", { requiresAuth: true }),
	getBookingsByTrip: (tripId) => request(`/bookings/trip/${tripId}`, { requiresAuth: true }),
	getBookedSeats: (tripId) => request(`/bookings/trip/${tripId}/seats`, { requiresAuth: true }),
	createBooking: (input) => request("/bookings", { method: "POST", body: input, requiresAuth: true }),
	cancelBooking: (bookingId) => request(`/bookings/${bookingId}/cancel`, { method: "PATCH", requiresAuth: true }),
};

export const paymentApi = {
	getMyPayments: () => request("/payments/my", { requiresAuth: true }),
	createPayment: (input) => request("/payments", { method: "POST", body: input, requiresAuth: true }),
};

export const feedbackApi = {
	getMyFeedback: () => request("/feedback/my", { requiresAuth: true }),
	createFeedback: (input) => request("/feedback", { method: "POST", body: input, requiresAuth: true }),
};

export const adminApi = {
	getStats: () => request("/admin/stats", { requiresAuth: true }),
};

export const tripApi = {
	getTrips: () => request("/trips", { requiresAuth: true }),
	startTrip: (tripId) => request(`/trips/${tripId}/start`, { method: "PATCH", requiresAuth: true }),
	endTrip: (tripId) => request(`/trips/${tripId}/end`, { method: "PATCH", requiresAuth: true }),
};

export const routeApi = {
	getRoutes: () => request("/routes", { requiresAuth: true }),
};

export const stopApi = {
	getStopsByRoute: (routeId) => request(`/stops/route/${routeId}`, { requiresAuth: true }),
};

export const vehicleApi = {
	getVehicles: () => request("/vehicles", { requiresAuth: true }),
};

export const locationApi = {
	update: (input) => request("/location/update", { method: "POST", body: input, requiresAuth: true }),
	getVehicleLocation: (vehicleId) => request(`/location/vehicle/${vehicleId}`, { requiresAuth: true }),
};

export const emergencyApi = {
	create: (input) => request("/emergency", { method: "POST", body: input, requiresAuth: true }),
	getAll: () => request("/emergency", { requiresAuth: true }),
	resolve: (id) => request(`/emergency/${id}/resolve`, { method: "PATCH", requiresAuth: true }),
};

export const notificationApi = {
	getMy: () => request("/notifications/my", { requiresAuth: true }),
	getAll: () => request("/notifications", { requiresAuth: true }),
	markRead: (id) => request(`/notifications/${id}/read`, { method: "PATCH", requiresAuth: true }),
};
