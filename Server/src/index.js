import express from "express"
import dotenv from "dotenv"

import { db } from "./config/database.js";

import authRoutes from "./routes/auth.route.js"
import bookingRoutes from "./routes/booking.route.js"
import locationRoutes from "./routes/location.route.js"
import routeRoutes from "./routes/route.route.js"
import stopRoutes from "./routes/stop.route.js"
import tripRoutes from "./routes/trip.route.js"
import vehicleRoutes from "./routes/vehicle.route.js"
import paymentRoutes from "./routes/payment.route.js"
import notificationRoutes from "./routes/notification.route.js"
import feedbackRoutes from "./routes/feedback.route.js"
import emergencyRoutes from "./routes/emergency.route.js"
import adminRoutes from "./routes/admin.route.js"

dotenv.config()

const app = express();
app.use(express.json())

const PORT = process.env.PORT

app.get("/", (req, res)=> {
    res.send("Hamro Sawari Server Running")
})


app.use("/api/auth", authRoutes)
app.use("/api/bookings", bookingRoutes)
app.use("/api/location", locationRoutes)
app.use("/api/routes", routeRoutes)
app.use("/api/stops", stopRoutes)
app.use("/api/trips", tripRoutes)
app.use("/api/vehicles", vehicleRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/feedback", feedbackRoutes)
app.use("/api/emergency", emergencyRoutes)
app.use("/api/admin", adminRoutes)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

