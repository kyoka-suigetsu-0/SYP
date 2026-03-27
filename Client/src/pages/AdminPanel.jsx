import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/styles/OIP.webp";
import {
  adminApi,
  clearAuthSession,
  emergencyApi,
  notificationApi,
  routeApi,
  tripApi,
  vehicleApi,
} from "../services/api";

const STATS = [
  { icon: "fa-ticket",      label: "Total Bookings", value: "12,485", change: "+8.2%",  up: true },
  { icon: "fa-users",       label: "Total Users",    value: "4,320",  change: "+12.5%", up: true },
  { icon: "fa-bus",         label: "Active Routes",  value: "214",    change: "+3",     up: true },
  { icon: "fa-sack-dollar", label: "Revenue (NPR)",  value: "8.4M",   change: "+5.1%",  up: true },
];

const BOOKINGS = [
  { id: "#BK001", user: "Ram Sharma",    from: "Kathmandu", to: "Pokhara",    date: "2025-03-10", type: "Deluxe AC",     status: "Confirmed", amount: "NPR 1,200" },
  { id: "#BK002", user: "Sita Thapa",   from: "Pokhara",   to: "Biratnagar", date: "2025-03-11", type: "Express",       status: "Pending",   amount: "NPR 2,100" },
  { id: "#BK003", user: "Hari Rai",     from: "Birgunj",   to: "Kathmandu",  date: "2025-03-11", type: "Standard",      status: "Confirmed", amount: "NPR 800"   },
  { id: "#BK004", user: "Maya Gurung",  from: "Kathmandu", to: "Butwal",     date: "2025-03-12", type: "Tourist Coach", status: "Cancelled", amount: "NPR 1,500" },
  { id: "#BK005", user: "Bikash Limbu", from: "Dharan",    to: "Kathmandu",  date: "2025-03-12", type: "Deluxe AC",     status: "Confirmed", amount: "NPR 1,800" },
  { id: "#BK006", user: "Anita KC",     from: "Kathmandu", to: "Janakpur",   date: "2025-03-13", type: "Express",       status: "Pending",   amount: "NPR 950"   },
];

const USERS = [
  { id: "U001", name: "Ram Sharma",    email: "ram@gmail.com",    phone: "+977-9800000001", bookings: 12, joined: "Jan 2024", status: "Active" },
  { id: "U002", name: "Sita Thapa",   email: "sita@gmail.com",   phone: "+977-9800000002", bookings: 7,  joined: "Feb 2024", status: "Active" },
  { id: "U003", name: "Hari Rai",     email: "hari@gmail.com",   phone: "+977-9800000003", bookings: 3,  joined: "Mar 2024", status: "Inactive" },
  { id: "U004", name: "Maya Gurung",  email: "maya@gmail.com",   phone: "+977-9800000004", bookings: 19, joined: "Dec 2023", status: "Active" },
  { id: "U005", name: "Bikash Limbu", email: "bikash@gmail.com", phone: "+977-9800000005", bookings: 5,  joined: "Apr 2024", status: "Active" },
];

const ROUTES = [
  { id: "R001", from: "Kathmandu", to: "Pokhara",    distance: "200 km", duration: "7 hrs",  buses: 8,  fare: "NPR 800–1,200",   status: "Active"   },
  { id: "R002", from: "Kathmandu", to: "Biratnagar", distance: "545 km", duration: "12 hrs", buses: 5,  fare: "NPR 1,500–2,100", status: "Active"   },
  { id: "R003", from: "Pokhara",   to: "Butwal",     distance: "150 km", duration: "4 hrs",  buses: 6,  fare: "NPR 600–900",     status: "Active"   },
  { id: "R004", from: "Birgunj",   to: "Kathmandu",  distance: "145 km", duration: "5 hrs",  buses: 10, fare: "NPR 700–1,000",   status: "Active"   },
  { id: "R005", from: "Kathmandu", to: "Janakpur",   distance: "225 km", duration: "8 hrs",  buses: 4,  fare: "NPR 900–1,300",   status: "Inactive" },
];

const DRIVERS = [
  { id: "D001", name: "Bikash Tamang",  phone: "+977-9812345678", vehicle: "BA 1 KHA 2345", route: "Kathmandu → Pokhara",    status: "Active",   trips: 142 },
  { id: "D002", name: "Rohan Thapa",   phone: "+977-9823456789", vehicle: "BA 2 JHA 5678", route: "Pokhara → Biratnagar",   status: "Active",   trips: 98  },
  { id: "D003", name: "Hari Gurung",   phone: "+977-9834567890", vehicle: "BA 3 KHA 9012", route: "Birgunj → Kathmandu",    status: "On Trip",  trips: 203 },
  { id: "D004", name: "Suman Rai",     phone: "+977-9845678901", vehicle: "BA 4 CHA 3456", route: "Kathmandu → Janakpur",   status: "Inactive", trips: 67  },
];

const NOTIFICATIONS = [
  { id: "N001", type: "warning",   message: "Driver Rohan Thapa is 8 minutes late on Pokhara → Biratnagar route.", time: "10 mins ago", read: false },
  { id: "N002", type: "emergency", message: "Driver Hari Gurung reported vehicle breakdown near Mugling.", time: "25 mins ago", read: false },
  { id: "N003", type: "info",      message: "New booking #BK006 received for Kathmandu → Janakpur.", time: "1 hr ago", read: true },
  { id: "N004", type: "warning",   message: "Driver Suman Rai is 12 minutes late. Rs.50 deducted from trip fare.", time: "2 hrs ago", read: true },
  { id: "N005", type: "info",      message: "User Maya Gurung cancelled booking #BK004. Refund initiated.", time: "3 hrs ago", read: true },
];

const MENU = [
  { id: "dashboard",     icon: "fa-gauge",              label: "Dashboard"     },
  { id: "bookings",      icon: "fa-ticket",             label: "Trips"         },
  { id: "users",         icon: "fa-triangle-exclamation", label: "Emergency"   },
  { id: "drivers",       icon: "fa-id-card",            label: "Fleet"         },
  { id: "routes",        icon: "fa-route",              label: "Routes"        },
  { id: "notifications", icon: "fa-bell",               label: "Notifications" },
  { id: "settings",      icon: "fa-gear",               label: "Settings"      },
];

const STATUS_STYLE = {
  Confirmed: { bg: "#f0fdf4", color: "#16a34a" },
  Pending:   { bg: "#fefce8", color: "#ca8a04" },
  Cancelled: { bg: "#fff0f0", color: "#e11d48" },
  Active:    { bg: "#f0fdf4", color: "#16a34a" },
  Inactive:  { bg: "#f5f5f5", color: "#999"    },
  "On Trip": { bg: "#eff6ff", color: "#2563eb" },
};

export default function AdminPanel() {
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [statsCards, setStatsCards] = useState(STATS);
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [emergencyReports, setEmergencyReports] = useState([]);
  const [adminError, setAdminError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const loadAdminData = async () => {
      try {
        const [statsResponse, notificationsResponse, tripsResponse, routesResponse, vehiclesResponse, emergencyResponse] = await Promise.all([
          adminApi.getStats(),
          notificationApi.getAll(),
          tripApi.getTrips(),
          routeApi.getRoutes(),
          vehicleApi.getVehicles(),
          emergencyApi.getAll(),
        ]);

        if (cancelled) return;

        const stats = statsResponse?.data || {};
        setStatsCards([
          { icon: "fa-ticket", label: "Total Bookings", value: String(stats.totalBookings || 0), change: "live", up: true },
          { icon: "fa-bus", label: "Total Trips", value: String(stats.totalTrips || 0), change: "live", up: true },
          { icon: "fa-sack-dollar", label: "Revenue (NPR)", value: Number(stats.totalRevenue || 0).toLocaleString(), change: "live", up: true },
          { icon: "fa-triangle-exclamation", label: "Emergency Reports", value: String(stats.totalEmergencyReports || 0), change: "live", up: true },
        ]);

        const rows = Array.isArray(notificationsResponse?.data) ? notificationsResponse.data : [];
        setNotifications(rows.map((item) => ({
          id: String(item.id),
          type: item.type || "info",
          message: item.message,
          time: item.created_at ? new Date(item.created_at).toLocaleString() : "recent",
          read: Boolean(item.is_read),
        })));

        setTrips(Array.isArray(tripsResponse?.data) ? tripsResponse.data : []);
        setRoutes(Array.isArray(routesResponse?.data) ? routesResponse.data : []);
        setVehicles(Array.isArray(vehiclesResponse?.data) ? vehiclesResponse.data : []);
        setEmergencyReports(Array.isArray(emergencyResponse?.data) ? emergencyResponse.data : []);
      } catch (err) {
        if (!cancelled) {
          setAdminError(err.message || "Could not load admin dashboard data.");
        }
      }
    };

    loadAdminData();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  const handleMarkNotificationRead = async (id) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
    try {
      await notificationApi.markRead(id);
    } catch {
      // Keep optimistic update to avoid noisy UX when one notification fails.
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((item) => !item.read).map((item) => item.id);
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));

    await Promise.all(unreadIds.map((id) => notificationApi.markRead(id).catch(() => null)));
  };

  const TH = ({ children }) => (
    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{children}</th>
  );

  const TD = ({ children, bold }) => (
    <td style={{ padding: "14px 16px", fontSize: 13, color: bold ? "#111" : "#555", fontWeight: bold ? 700 : 400 }}>{children}</td>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%", fontFamily: "'Poppins', sans-serif", background: "#f5f5f5" }}>

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 240 : 70, background: "white",
        display: "flex", flexDirection: "column", transition: "width 0.3s",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100, overflow: "hidden", flexShrink: 0,
        borderRight: "1px solid #eee",
      }}>
        <div style={{ padding: "20px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
          <img src={logo} alt="logo" style={{ width: 36, height: 36, objectFit: "contain", background: "white", borderRadius: 8, padding: 4, flexShrink: 0 }} />
          {sidebarOpen && <span style={{ fontWeight: 900, fontSize: 13, letterSpacing: "0.1em", fontFamily: "'Poppins', sans-serif", whiteSpace: "nowrap", color: "#111" }}>HAMRO SAWARI</span>}
        </div>

        {sidebarOpen && (
          <div style={{ padding: "18px 14px", borderBottom: "1px solid #f3f4f6" }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111" }}>Admin Panel</p>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "#6b7280" }}>Super Administrator</p>
          </div>
        )}

        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {MENU.map(({ id, icon, label }) => (
            <button key={id} onClick={() => setActive(id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: "11px 12px", borderRadius: 10, marginBottom: 4,
              background: active === id ? "#f3f4f6" : "transparent",
              color: active === id ? "#111" : "#4b5563",
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
          <button onClick={handleLogout} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            padding: "11px 12px", borderRadius: 10, background: "transparent",
            color: "#4b5563", border: "none", cursor: "pointer", whiteSpace: "nowrap",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,0,0,0.1)"; e.currentTarget.style.color = "#f87171"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
          >
            <i className="fa-solid fa-right-from-bracket" style={{ fontSize: 15, flexShrink: 0, width: 20, textAlign: "center" }}></i>
            {sidebarOpen && <span style={{ fontSize: 13, fontWeight: 600 }}>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: sidebarOpen ? 240 : 70, transition: "margin-left 0.3s", display: "flex", flexDirection: "column" }}>

        {/* Topbar */}
        <div style={{ background: "white", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #eee", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => setSidebarOpen(p => !p)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#555" }}>
              <i className="fa-solid fa-bars"></i>
            </button>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#111", textTransform: "capitalize" }}>{active}</h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => setActive("notifications")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#777", position: "relative" }}>
              <i className="fa-solid fa-bell"></i>
              {notifications.filter(n => !n.read).length > 0 && (
                <span style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, background: "#e11d48", borderRadius: "50%", fontSize: 10, fontWeight: 700, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="fa-solid fa-user-shield" style={{ fontSize: 14, color: "white" }}></i>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, padding: 28 }}>

          {adminError && (
            <div style={{ background: "#fff0f0", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#e11d48", display: "flex", alignItems: "center", gap: 6 }}>
                <i className="fa-solid fa-circle-exclamation"></i> {adminError}
              </p>
            </div>
          )}

          {/* DASHBOARD */}
          {active === "dashboard" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 28 }}>
                {statsCards.map(({ icon, label, value, change, up }) => (
                  <div key={label} style={{ background: "white", borderRadius: 16, padding: "24px 20px", border: "1.5px solid #eee" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div style={{ width: 44, height: 44, background: "#000", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className={`fa-solid ${icon}`} style={{ color: "white", fontSize: 18 }}></i>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: up ? "#16a34a" : "#e11d48", background: up ? "#f0fdf4" : "#fff0f0", padding: "3px 8px", borderRadius: 50 }}>
                        <i className={`fa-solid fa-arrow-${up ? "up" : "down"}`} style={{ marginRight: 4, fontSize: 10 }}></i>{change}
                      </span>
                    </div>
                    <p style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 900, color: "#111", fontFamily: "'Poppins', sans-serif" }}>{value}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#999", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</p>
                  </div>
                ))}
              </div>

              <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Recent Trips</h2>
                  <button onClick={() => setActive("bookings")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#555" }}>
                    View All <i className="fa-solid fa-arrow-right-long" style={{ marginLeft: 6 }}></i>
                  </button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr style={{ background: "#f9f9f9" }}>{["Trip ID","Route","Date","Departure","Vehicle","Status","Seats"].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
                    <tbody>
                      {trips.slice(0, 4).map((trip, i) => (
                        <tr key={trip.id} style={{ borderTop: "1px solid #f0f0f0", background: i%2===0?"white":"#fafafa" }}>
                          <TD bold>#{trip.id}</TD>
                          <TD bold>{trip.route_name || "-"}</TD>
                          <TD>{String(trip.trip_date || "").slice(0, 10)}</TD>
                          <TD>{trip.departure_time || "-"}</TD>
                          <TD>{trip.vehicle_type || "-"}</TD>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{ ...STATUS_STYLE[trip.status === "completed" ? "Inactive" : "Active"], fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 50, textTransform: "capitalize" }}>{trip.status}</span>
                          </td>
                          <TD bold>{trip.total_seats || 0}</TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* BOOKINGS */}
          {active === "bookings" && (
            <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>All Trips</h2>
                <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#bbb", fontSize: 13 }}></i>
                  <input placeholder="Live data" style={{ paddingLeft: 36, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: "1.5px solid #eee", borderRadius: 8, fontSize: 13, outline: "none" }} readOnly />
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ background: "#f9f9f9" }}>{["ID","Route","Date","Departure","Vehicle","Driver ID","Status","Seats"].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
                  <tbody>
                    {trips.map((trip,i) => (
                      <tr key={trip.id} style={{ borderTop: "1px solid #f0f0f0", background: i%2===0?"white":"#fafafa" }}>
                        <TD bold>#{trip.id}</TD>
                        <TD bold>{trip.route_name || "-"}</TD>
                        <TD>{String(trip.trip_date || "").slice(0, 10)}</TD>
                        <TD>{trip.departure_time || "-"}</TD>
                        <TD>{trip.vehicle_number || "-"}</TD>
                        <TD>{trip.driver_id || "-"}</TD>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ ...STATUS_STYLE[trip.status === "completed" ? "Inactive" : "Active"], fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 50, textTransform: "capitalize" }}>{trip.status}</span>
                        </td>
                        <TD bold>{trip.total_seats || 0}</TD>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USERS */}
          {active === "users" && (
            <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Emergency Reports</h2>
                <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#bbb", fontSize: 13 }}></i>
                  <input placeholder="Live data" style={{ paddingLeft: 36, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: "1.5px solid #eee", borderRadius: 8, fontSize: 13, outline: "none" }} readOnly />
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ background: "#f9f9f9" }}>{["ID","Driver","Route","Message","Status","Created"].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
                  <tbody>
                    {emergencyReports.map((report,i) => (
                      <tr key={report.id} style={{ borderTop: "1px solid #f0f0f0", background: i%2===0?"white":"#fafafa" }}>
                        <TD bold>#{report.id}</TD>
                        <TD bold>{report.driver_name || `#${report.driver_id}`}</TD>
                        <TD>{report.route_name || "-"}</TD>
                        <TD>{report.message}</TD>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ ...STATUS_STYLE[report.status === "resolved" ? "Active" : "Pending"], fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 50, textTransform: "capitalize" }}>{report.status}</span>
                        </td>
                        <TD>{report.created_at ? new Date(report.created_at).toLocaleString() : "-"}</TD>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ROUTES */}
          {active === "routes" && (
            <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Bus Routes</h2>
                <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>Live data</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ background: "#f9f9f9" }}>{["ID","Route Name","From","To","Distance","Duration (min)"].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
                  <tbody>
                    {routes.map((route,i) => (
                      <tr key={route.id} style={{ borderTop: "1px solid #f0f0f0", background: i%2===0?"white":"#fafafa" }}>
                        <TD>#{route.id}</TD>
                        <TD bold>{route.route_name}</TD>
                        <TD>{route.start_location}</TD>
                        <TD>{route.end_location}</TD>
                        <TD>{route.distance_km} km</TD>
                        <TD>{route.estimated_time}</TD>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DRIVERS */}
          {active === "drivers" && (
            <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Fleet & Drivers</h2>
                <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>Live data</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ background: "#f9f9f9" }}>{["Vehicle ID","Vehicle No.","Type","Seats","Driver","Phone","Status"].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
                  <tbody>
                    {vehicles.map((vehicle,i) => (
                      <tr key={vehicle.id} style={{ borderTop: "1px solid #f0f0f0", background: i%2===0?"white":"#fafafa" }}>
                        <TD>#{vehicle.id}</TD>
                        <TD bold>{vehicle.vehicle_number}</TD>
                        <TD>{vehicle.vehicle_type || "-"}</TD>
                        <TD>{vehicle.total_seats}</TD>
                        <TD>{vehicle.driver_name || "Unassigned"}</TD>
                        <TD>{vehicle.driver_phone || "-"}</TD>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ ...STATUS_STYLE[String(vehicle.status || "active").toLowerCase() === "active" ? "Active" : "Inactive"], fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 50, textTransform: "capitalize" }}>{vehicle.status || "active"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {active === "notifications" && (
            <div style={{ maxWidth: 700 }}>
              <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Notifications</h2>
                  <button 
                    onClick={handleMarkAllRead}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#555" }}
                  >
                    Mark all as read
                  </button>
                </div>
                <div>
                  {notifications.map((n, i) => (
                    <div 
                      key={n.id} 
                      onClick={() => handleMarkNotificationRead(n.id)}
                      style={{ 
                        padding: "18px 24px", 
                        borderBottom: i < notifications.length-1 ? "1px solid #f0f0f0" : "none", 
                        display: "flex", 
                        gap: 16, 
                        cursor: "pointer", 
                        background: n.read ? "white" : "#fafafa" 
                      }}
                    >
                      <div style={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: "50%", 
                        flexShrink: 0, 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        background: n.type === "emergency" ? "#fff0f0" : n.type === "warning" ? "#fefce8" : "#eff6ff" 
                      }}>
                        <i className={`fa-solid ${n.type === "emergency" ? "fa-triangle-exclamation" : n.type === "warning" ? "fa-clock" : "fa-circle-info"}`}
                          style={{ fontSize: 16, color: n.type === "emergency" ? "#e11d48" : n.type === "warning" ? "#ca8a04" : "#2563eb" }}></i>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: n.read ? 400 : 700, color: "#111", lineHeight: 1.5 }}>{n.message}</p>
                        <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>{n.time}</p>
                      </div>
                      {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e11d48", flexShrink: 0, marginTop: 6 }} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {active === "settings" && (
            <div style={{ maxWidth: 600 }}>
              <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", padding: 32 }}>
                <h2 style={{ margin: "0 0 24px", fontSize: 16, fontWeight: 900 }}>Site Settings</h2>
                {[
                  { label: "Site Name",     value: "Hamro Sawari",          icon: "fa-globe"     },
                  { label: "Admin Email",   value: "admin@hamrosawari.com",  icon: "fa-envelope"  },
                  { label: "Support Phone", value: "+977-123-456789",        icon: "fa-phone"     },
                  { label: "Address",       value: "New Baneshwor, KTM",     icon: "fa-map-pin"   },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{label}</label>
                    <div style={{ position: "relative", display: "flex", alignItems: "center", borderBottom: "1.5px solid #ddd" }}>
                      <i className={`fa-solid ${icon}`} style={{ position: "absolute", left: 2, color: "#bbb", fontSize: 13 }}></i>
                      <input defaultValue={value} style={{ flex: 1, border: "none", background: "transparent", padding: "8px 8px 8px 28px", fontSize: 14, outline: "none", fontFamily: "inherit", color: "#222" }} />
                    </div>
                  </div>
                ))}
                <button style={{ background: "#000", color: "white", border: "none", borderRadius: 50, padding: "12px 28px", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 8 }}>
                  Save Changes
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}