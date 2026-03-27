import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/styles/OIP.webp";
import {
  bookingApi,
  clearAuthSession,
  emergencyApi,
  getStoredUser,
  locationApi,
  stopApi,
  tripApi,
} from "../services/api";

const DRIVER = {
  name: "Suprim khadka",
  id: "DRV-001",
  phone: "+977-9812345678",
  vehicle: "BA 1 KHA 2345",
  photo: "https://randomuser.me/api/portraits/men/52.jpg",
  
  qr: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=eSewa-DRV001-SuprimKhadka",
};

const ROUTE = {
  name: "Kathmandu → Pokhara",
  stops: [
    { name: "Kathmandu (New Bus Park)", time: "06:00 AM", status: "departed" },
    { name: "Naubise",                  time: "07:00 AM", status: "departed" },
    { name: "Mugling",                  time: "08:30 AM", status: "current"  },
    { name: "Dumre",                    time: "09:30 AM", status: "upcoming" },
    { name: "Damauli",                  time: "10:00 AM", status: "upcoming" },
    { name: "Pokhara (Prithvi Chowk)", time: "11:00 AM", status: "upcoming" },
  ],
};

const PASSENGERS = [
  { seat: "A1", name: "Ram Sharma",   boarded: true  },
  { seat: "A2", name: "Sita Thapa",   boarded: true  },
  { seat: "B1", name: "Hari Rai",     boarded: false },
  { seat: "B2", name: "Maya Gurung",  boarded: true  },
  { seat: "C1", name: "Bikash Limbu", boarded: false },
];

const MENU = [
  { id: "dashboard",  icon: "fa-gauge",          label: "Dashboard"     },
  { id: "route",      icon: "fa-route",          label: "My Route"      },
  { id: "passengers", icon: "fa-users",          label: "Passengers"    },
  { id: "location",   icon: "fa-location-dot",   label: "My Location"   },
  { id: "emergency",  icon: "fa-triangle-exclamation", label: "Emergency" },
];

export default function DriverDashboard() {
  const storedUser = getStoredUser();
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [isTripLoading, setIsTripLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({ type: "", message: "" });
  const [emergencySent, setEmergencySent] = useState(false);
  const [passengers, setPassengers] = useState(PASSENGERS);
  const [routeStops, setRouteStops] = useState(ROUTE.stops);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationUpdated, setLocationUpdated] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const navigate = useNavigate();

  const driverProfile = useMemo(() => ({
    ...DRIVER,
    name: storedUser?.name || DRIVER.name,
    phone: storedUser?.phone || DRIVER.phone,
  }), [storedUser]);

  const formatStopTime = (departureTime, offset) => {
    if (!departureTime) return "--:--";

    const [hour = 0, minute = 0] = String(departureTime)
      .split(":")
      .map((part) => Number(part));
    const totalMinutes = (hour * 60) + minute + Number(offset || 0);
    const normalized = ((totalMinutes % 1440) + 1440) % 1440;
    const hh = String(Math.floor(normalized / 60)).padStart(2, "0");
    const mm = String(normalized % 60).padStart(2, "0");

    return `${hh}:${mm}`;
  };

  useEffect(() => {
    let cancelled = false;

    const loadDriverData = async () => {
      setIsTripLoading(true);
      setDashboardError("");

      try {
        const tripResponse = await tripApi.getTrips();
        const trips = Array.isArray(tripResponse?.data) ? tripResponse.data : [];
        const mine = trips.filter((trip) => Number(trip.driver_id) === Number(storedUser?.id));
        const activeTrip = mine.find((trip) => trip.status === "ongoing") || mine.find((trip) => trip.status === "scheduled") || mine[0] || null;

        if (!cancelled) {
          setCurrentTrip(activeTrip);
        }

        if (activeTrip) {
          const [bookingResponse, stopResponse, vehicleLocationResponse] = await Promise.all([
            bookingApi.getBookingsByTrip(activeTrip.id),
            stopApi.getStopsByRoute(activeTrip.route_id),
            locationApi.getVehicleLocation(activeTrip.vehicle_id),
          ]);
          const rows = Array.isArray(bookingResponse?.data) ? bookingResponse.data : [];

          const stopRows = Array.isArray(stopResponse?.data) ? stopResponse.data : [];
          const mappedStops = stopRows.map((stop, index) => {
            const status =
              activeTrip.status === "completed"
                ? "departed"
                : activeTrip.status === "ongoing"
                  ? index === 0
                    ? "current"
                    : "upcoming"
                  : "upcoming";

            return {
              name: stop.stop_name,
              time: formatStopTime(activeTrip.departure_time, stop.arrival_offset_minutes),
              status,
            };
          });

          const locationData = vehicleLocationResponse?.data || null;

          if (!cancelled) {
            setPassengers(rows.map((item) => {
              const seatNo = Number(item.seat_number || 0);
              const row = Math.ceil(seatNo / 4) || 1;
              const col = "ABCD"[(seatNo - 1) % 4] || "A";
              return {
                seat: `${row}${col}`,
                name: item.user_name || "Passenger",
                boarded: false,
              };
            }));
            if (mappedStops.length > 0) {
              setRouteStops(mappedStops);
            }
            setCurrentLocation(locationData);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setDashboardError(err.message || "Could not load driver dashboard data.");
        }
      } finally {
        if (!cancelled) {
          setIsTripLoading(false);
        }
      }
    };

    loadDriverData();

    return () => {
      cancelled = true;
    };
  }, [storedUser?.id]);

  const toggleBoarded = (seat) => {
    setPassengers(p => p.map(x => x.seat === seat ? { ...x, boarded: !x.boarded } : x));
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  const handleStartTrip = async () => {
    if (!currentTrip) return;

    setIsActionLoading(true);
    setDashboardError("");

    try {
      const response = await tripApi.startTrip(currentTrip.id);
      setCurrentTrip(response?.data || currentTrip);
    } catch (err) {
      setDashboardError(err.message || "Could not start trip.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEndTrip = async () => {
    if (!currentTrip) return;

    setIsActionLoading(true);
    setDashboardError("");

    try {
      const response = await tripApi.endTrip(currentTrip.id);
      setCurrentTrip(response?.data || currentTrip);
    } catch (err) {
      setDashboardError(err.message || "Could not end trip.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLocationUpdate = async () => {
    if (!currentTrip?.vehicle_id) return;

    setIsActionLoading(true);
    setDashboardError("");

    try {
      await locationApi.update({
        vehicle_id: currentTrip.vehicle_id,
        latitude: 27.7172,
        longitude: 85.324,
      });
      const locationResponse = await locationApi.getVehicleLocation(currentTrip.vehicle_id);
      setCurrentLocation(locationResponse?.data || null);
      setLocationUpdated(true);
      setTimeout(() => setLocationUpdated(false), 3000);
    } catch (err) {
      setDashboardError(err.message || "Could not update location.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEmergencySubmit = async () => {
    if (!emergencyForm.type || !emergencyForm.message) return;

    setIsActionLoading(true);
    setDashboardError("");

    try {
      await emergencyApi.create({
        trip_id: currentTrip?.id || null,
        message: `[${emergencyForm.type}] ${emergencyForm.message}`,
      });
      setEmergencySent(true);
    } catch (err) {
      setDashboardError(err.message || "Could not send emergency report.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const routeData = currentTrip
    ? {
        name: currentTrip.route_name || ROUTE.name,
        stops: routeStops,
      }
    : ROUTE;

  const tripStarted = currentTrip?.status === "ongoing";
  const tripEnded = currentTrip?.status === "completed";

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%", fontFamily: "'Poppins', sans-serif", background: "#f5f5f5" }}>

      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? 240 : 70, background: "white", display: "flex", flexDirection: "column", transition: "width 0.3s", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100, overflow: "hidden", borderRight: "1px solid #eee" }}>
        <div style={{ padding: "20px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
          <img src={logo} alt="logo" style={{ width: 36, height: 36, objectFit: "contain", background: "white", borderRadius: 8, padding: 4, flexShrink: 0 }} />
          {sidebarOpen && <span style={{ fontWeight: 900, fontSize: 13, letterSpacing: "0.1em", fontFamily: "'Poppins', sans-serif", whiteSpace: "nowrap", color: "#111" }}>HAMRO SAWARI</span>}
        </div>

        {sidebarOpen && (
          <div style={{ padding: "14px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 10 }}>
            <img src={driverProfile.photo} alt={driverProfile.name} style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #e5e7eb" }} />
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140 }}>{driverProfile.name}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>Driver · {storedUser?.id || DRIVER.id}</p>
            </div>
          </div>
        )}

        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {MENU.map(({ id, icon, label }) => (
            <button key={id} onClick={() => setActive(id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10, marginBottom: 4,
              background: active === id ? "#f3f4f6" : "transparent", color: active === id ? "#111" : "#4b5563",
              border: "none", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
            }}
              onMouseEnter={e => { if (active !== id) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={e => { if (active !== id) e.currentTarget.style.background = "transparent"; }}
            >
              <i className={`fa-solid ${icon}`} style={{ fontSize: 15, flexShrink: 0, width: 20, textAlign: "center" }}></i>
              {sidebarOpen && <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>}
            </button>
          ))}
        </nav>

        <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10, background: "transparent", color: "#4b5563", border: "none", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,0,0,0.1)"; e.currentTarget.style.color = "#f87171"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
          >
            <i className="fa-solid fa-right-from-bracket" style={{ fontSize: 15, flexShrink: 0, width: 20, textAlign: "center" }}></i>
            {sidebarOpen && <span style={{ fontSize: 13, fontWeight: 600 }}>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: sidebarOpen ? 240 : 70, transition: "margin-left 0.3s", display: "flex", flexDirection: "column" }}>

        {/* Topbar */}
        <div style={{ background: "white", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #eee", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => setSidebarOpen(p => !p)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#555" }}>
              <i className="fa-solid fa-bars"></i>
            </button>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#111" }}>{MENU.find(m => m.id === active)?.label}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Trip status badge */}
            <span style={{
              fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 50,
              background: tripEnded ? "#f5f5f5" : tripStarted ? "#f0fdf4" : "#fefce8",
              color: tripEnded ? "#999" : tripStarted ? "#16a34a" : "#ca8a04",
            }}>
              <i className={`fa-solid ${tripEnded ? "fa-flag-checkered" : tripStarted ? "fa-circle-dot" : "fa-clock"}`} style={{ marginRight: 6 }}></i>
              {tripEnded ? "Trip Ended" : tripStarted ? "Trip Active" : "Not Started"}
            </span>
            <img src={driverProfile.photo} alt={driverProfile.name} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "2px solid #eee" }} />
          </div>
        </div>

        <div style={{ flex: 1, padding: 28 }}>

          {isTripLoading && (
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#2563eb" }}>
                Loading trip data...
              </p>
            </div>
          )}

          {dashboardError && (
            <div style={{ background: "#fff0f0", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#e11d48", display: "flex", alignItems: "center", gap: 6 }}>
                <i className="fa-solid fa-circle-exclamation"></i> {dashboardError}
              </p>
            </div>
          )}

          {/* DASHBOARD */}
          {active === "dashboard" && (
            <div>
              {/* Welcome */}
              <div style={{ background: "#000", borderRadius: 20, padding: "28px 32px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -20, top: -20, width: 180, height: 180, background: "rgba(255,255,255,0.03)", borderRadius: "50%" }} />
                <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <img src={driverProfile.photo} alt={driverProfile.name} style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.2)" }} />
                    <div>
                      <p style={{ margin: "0 0 4px", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Good morning,</p>
                      <h2 style={{ margin: "0 0 4px", color: "white", fontSize: 22, fontWeight: 900, fontFamily: "'Poppins', sans-serif" }}>{driverProfile.name}</h2>
                      <p style={{ margin: 0, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Vehicle: {currentTrip?.vehicle_number || DRIVER.vehicle} · {storedUser?.id || DRIVER.id}</p>
                    </div>
                  </div>
                  {/* QR code */}
                  <div style={{ textAlign: "center" }}>
                    <img src={DRIVER.qr} alt="QR" style={{ width: 80, height: 80, borderRadius: 8, background: "white", padding: 4 }} />
                    <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>Fare QR</p>
                  </div>
                </div>
              </div>

              {/* Today's route */}
              <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", padding: "24px", marginBottom: 24 }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 900 }}>Today's Route</h3>
                <p style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 900, fontFamily: "'Poppins', sans-serif", color: "#111" }}>{routeData.name}</p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {[
                    { label: "Departure", value: currentTrip?.departure_time || "06:00 AM", icon: "fa-clock" },
                    { label: "Arrival",   value: "11:00 AM", icon: "fa-flag-checkered" },
                    { label: "Stops",     value: routeData.stops.length, icon: "fa-map-pin" },
                    { label: "Passengers",value: passengers.length,  icon: "fa-users" },
                  ].map(({ label, value, icon }) => (
                    <div key={label} style={{ background: "#f9f9f9", borderRadius: 12, padding: "14px 20px", flex: 1, minWidth: 120, border: "1.5px solid #f0f0f0" }}>
                      <i className={`fa-solid ${icon}`} style={{ color: "#999", fontSize: 14, marginBottom: 8, display: "block" }}></i>
                      <p style={{ margin: "0 0 2px", fontSize: 18, fontWeight: 900, color: "#111" }}>{value}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trip controls */}
              <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", padding: "24px" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 900 }}>Trip Controls</h3>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    disabled={tripStarted || tripEnded || isActionLoading}
                    onClick={handleStartTrip}
                    style={{ flex: 1, minWidth: 160, padding: "14px 20px", borderRadius: 12, border: "none", cursor: tripStarted || tripEnded ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 14, letterSpacing: "0.05em", background: tripStarted ? "#f0f0f0" : "#16a34a", color: tripStarted ? "#aaa" : "white", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
                  >
                    <i className="fa-solid fa-play"></i> Start Trip
                  </button>
                  <button
                    disabled={!tripStarted || tripEnded || isActionLoading}
                    onClick={handleEndTrip}
                    style={{ flex: 1, minWidth: 160, padding: "14px 20px", borderRadius: 12, border: "none", cursor: !tripStarted || tripEnded ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 14, letterSpacing: "0.05em", background: !tripStarted || tripEnded ? "#f0f0f0" : "#e11d48", color: !tripStarted || tripEnded ? "#aaa" : "white", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
                  >
                    <i className="fa-solid fa-stop"></i> End Trip
                  </button>
                  <button onClick={() => setActive("emergency")}
                    style={{ flex: 1, minWidth: 160, padding: "14px 20px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, letterSpacing: "0.05em", background: "#fef9c3", color: "#ca8a04", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
                  >
                    <i className="fa-solid fa-triangle-exclamation"></i> Report Emergency
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ROUTE */}
          {active === "route" && (
            <div style={{ maxWidth: 640 }}>
              <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #eee", background: "#000" }}>
                  <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 900, color: "white" }}>{routeData.name}</h2>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{routeData.stops.length} stops · Departure {currentTrip?.departure_time || "06:00 AM"}</p>
                </div>
                <div style={{ padding: "24px" }}>
                  {routeData.stops.map((stop, i) => (
                    <div key={i} style={{ display: "flex", gap: 16, marginBottom: i < routeData.stops.length - 1 ? 0 : 0 }}>
                      {/* Timeline */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                        <div style={{
                          width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                          background: stop.status === "departed" ? "#16a34a" : stop.status === "current" ? "#000" : "#e5e5e5",
                          border: stop.status === "current" ? "3px solid #000" : "none",
                          outline: stop.status === "current" ? "3px solid rgba(0,0,0,0.15)" : "none",
                          marginTop: 2,
                        }} />
                        {i < routeData.stops.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 40, background: stop.status === "departed" ? "#16a34a" : "#eee", margin: "4px 0" }} />}
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, paddingBottom: i < routeData.stops.length - 1 ? 16 : 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: stop.status === "current" ? 900 : 600, color: stop.status === "upcoming" ? "#aaa" : "#111" }}>{stop.name}</p>
                          <span style={{
                            fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 50,
                            background: stop.status === "departed" ? "#f0fdf4" : stop.status === "current" ? "#000" : "#f5f5f5",
                            color: stop.status === "departed" ? "#16a34a" : stop.status === "current" ? "white" : "#aaa",
                          }}>
                            {stop.status === "current" ? "📍 Current" : stop.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PASSENGERS */}
          {active === "passengers" && (
            <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Passenger List</h2>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 50, background: "#f0fdf4", color: "#16a34a" }}>
                    {passengers.filter(p => p.boarded).length} Boarded
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 50, background: "#fff0f0", color: "#e11d48" }}>
                    {passengers.filter(p => !p.boarded).length} Not Boarded
                  </span>
                </div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9f9f9" }}>
                    {["Seat", "Passenger", "Status", "Action"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {passengers.map((p, i) => (
                    <tr key={p.seat} style={{ borderTop: "1px solid #f0f0f0", background: i % 2 === 0 ? "white" : "#fafafa" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ background: "#000", color: "white", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 6 }}>{p.seat}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: "#111" }}>{p.name}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 50, background: p.boarded ? "#f0fdf4" : "#fff0f0", color: p.boarded ? "#16a34a" : "#e11d48" }}>
                          {p.boarded ? "Boarded" : "Not Boarded"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <button onClick={() => toggleBoarded(p.seat)} style={{ background: p.boarded ? "#fff0f0" : "#f0fdf4", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: p.boarded ? "#e11d48" : "#16a34a" }}>
                          {p.boarded ? "Mark Absent" : "Mark Boarded"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* LOCATION */}
          {active === "location" && (
            <div style={{ maxWidth: 580 }}>
              <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", padding: 32, marginBottom: 20 }}>
                <h2 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 900 }}>Update My Location</h2>
                <p style={{ margin: "0 0 24px", fontSize: 13, color: "#999" }}>Your location updates automatically via GPS. You can also update it manually.</p>

                {/* Map placeholder */}
                <div style={{ width: "100%", height: 220, background: "#f0f0f0", borderRadius: 12, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #eee", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
                  <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                    <i className="fa-solid fa-location-dot" style={{ fontSize: 40, color: "#e11d48", display: "block", marginBottom: 10 }}></i>
                    <p style={{ margin: 0, fontSize: 13, color: "#777", fontWeight: 600 }}>Mugling, Chitwan</p>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#aaa" }}>
                      {currentLocation
                        ? `${Number(currentLocation.latitude || 0).toFixed(4)}° N, ${Number(currentLocation.longitude || 0).toFixed(4)}° E`
                        : "27.8657° N, 84.5152° E"}
                    </p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Current Stop</label>
                    <div style={{ position: "relative", borderBottom: "1.5px solid #ddd", display: "flex", alignItems: "center" }}>
                      <i className="fa-solid fa-map-pin" style={{ position: "absolute", left: 2, color: "#bbb", fontSize: 13 }}></i>
                      <input defaultValue="Mugling" style={{ flex: 1, border: "none", background: "transparent", padding: "8px 8px 8px 28px", fontSize: 14, outline: "none", fontFamily: "inherit", color: "#222" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Next Stop</label>
                    <div style={{ position: "relative", borderBottom: "1.5px solid #ddd", display: "flex", alignItems: "center" }}>
                      <i className="fa-solid fa-flag" style={{ position: "absolute", left: 2, color: "#bbb", fontSize: 13 }}></i>
                      <input defaultValue="Dumre" style={{ flex: 1, border: "none", background: "transparent", padding: "8px 8px 8px 28px", fontSize: 14, outline: "none", fontFamily: "inherit", color: "#222" }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={handleLocationUpdate} disabled={isActionLoading} style={{ flex: 1, background: "#000", color: "white", border: "none", borderRadius: 10, padding: "13px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <i className="fa-solid fa-location-arrow"></i> Update Location
                  </button>
                  <button style={{ flex: 1, background: "#f0fdf4", color: "#16a34a", border: "none", borderRadius: 10, padding: "13px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <i className="fa-solid fa-satellite-dish"></i> Auto GPS
                  </button>
                </div>

                {locationUpdated && (
                  <div style={{ marginTop: 16, background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                    <i className="fa-solid fa-circle-check" style={{ color: "#16a34a", fontSize: 16 }}></i>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>Location updated successfully!</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EMERGENCY */}
          {active === "emergency" && (
            <div style={{ maxWidth: 580 }}>
              <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", padding: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <div style={{ width: 44, height: 44, background: "#fef9c3", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 20, color: "#ca8a04" }}></i>
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Report Emergency</h2>
                    <p style={{ margin: 0, fontSize: 13, color: "#999" }}>Admin will be notified immediately</p>
                  </div>
                </div>
                <div style={{ height: 1, background: "#f0f0f0", margin: "20px 0" }} />

                {emergencySent ? (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <i className="fa-solid fa-circle-check" style={{ fontSize: 48, color: "#16a34a", display: "block", marginBottom: 16 }}></i>
                    <h3 style={{ margin: "0 0 8px", fontFamily: "'Poppins', sans-serif" }}>Report Sent!</h3>
                    <p style={{ color: "#999", fontSize: 14 }}>Admin has been notified. Help is on the way.</p>
                  </div>
                ) : (
                  <>
                    {/* Emergency type */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Emergency Type</label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {[
                          { value: "breakdown",  label: "Vehicle Breakdown", icon: "fa-car-burst"          },
                          { value: "accident",   label: "Accident",          icon: "fa-circle-exclamation" },
                          { value: "medical",    label: "Medical Emergency", icon: "fa-kit-medical"        },
                          { value: "delay",      label: "Severe Delay",      icon: "fa-clock"              },
                        ].map(({ value, label, icon }) => (
                          <button key={value} onClick={() => setEmergencyForm(f => ({ ...f, type: value }))} style={{
                            padding: "14px 12px", borderRadius: 12, border: "1.5px solid", cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                            borderColor: emergencyForm.type === value ? "#000" : "#eee",
                            background: emergencyForm.type === value ? "#000" : "white",
                          }}>
                            <i className={`fa-solid ${icon}`} style={{ fontSize: 18, color: emergencyForm.type === value ? "white" : "#aaa", display: "block", marginBottom: 8 }}></i>
                            <span style={{ fontSize: 13, fontWeight: 600, color: emergencyForm.type === value ? "white" : "#333" }}>{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div style={{ marginBottom: 24 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Details</label>
                      <textarea placeholder="Describe the emergency in detail..." rows={4} value={emergencyForm.message}
                        onChange={e => setEmergencyForm(f => ({ ...f, message: e.target.value }))}
                        style={{ width: "100%", border: "none", borderBottom: "1.5px solid #ddd", background: "transparent", padding: "8px 0", fontSize: 14, outline: "none", fontFamily: "inherit", resize: "none", color: "#222", boxSizing: "border-box" }} />
                    </div>

                    <button onClick={handleEmergencySubmit} disabled={isActionLoading} style={{
                      width: "100%", background: "#e11d48", color: "white", border: "none", borderRadius: 10,
                      padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10, letterSpacing: "0.05em",
                    }}>
                      <i className="fa-solid fa-triangle-exclamation"></i> Send Emergency Report
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}