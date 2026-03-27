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
app.use((req, res, next) => {
    const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

    res.header("Access-Control-Allow-Origin", allowedOrigin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    return next();
})

app.use(express.json())

const PORT = process.env.PORT || 5000

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

