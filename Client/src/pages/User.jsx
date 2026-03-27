import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/styles/OIP.webp";
import {
  bookingApi,
  clearAuthSession,
  feedbackApi,
  getStoredUser,
  paymentApi,
} from "../services/api";

const USER = {
  name: "Suprem Khadka",
  email: "ram@gmail.com",
  phone: "+977-9800000001",
  joined: "January 2024",
};

const MY_BOOKINGS = [
  { id: "#BK001", from: "Kathmandu", to: "Pokhara",    date: "2025-03-10", time: "06:00 AM", type: "Deluxe AC",     seats: 2, status: "Confirmed", amount: "NPR 2,400" },
  { id: "#BK002", from: "Pokhara",   to: "Kathmandu",  date: "2025-03-15", time: "08:00 AM", type: "Express",       seats: 1, status: "Confirmed", amount: "NPR 900"   },
  { id: "#BK003", from: "Kathmandu", to: "Biratnagar", date: "2025-02-20", time: "07:00 PM", type: "Tourist Coach", seats: 3, status: "Completed", amount: "NPR 5,100" },
  { id: "#BK004", from: "Birgunj",   to: "Kathmandu",  date: "2025-02-01", time: "05:00 AM", type: "Standard",      seats: 1, status: "Cancelled", amount: "NPR 800"   },
];

const PAYMENTS = [
  { id: "#PAY001", booking: "#BK001", date: "2025-03-08", method: "eSewa",     amount: "NPR 2,400", status: "Paid"     },
  { id: "#PAY002", booking: "#BK002", date: "2025-03-13", method: "Khalti",    amount: "NPR 900",   status: "Paid"     },
  { id: "#PAY003", booking: "#BK003", date: "2025-02-18", method: "Bank Card", amount: "NPR 5,100", status: "Paid"     },
  { id: "#PAY004", booking: "#BK004", date: "2025-01-30", method: "eSewa",     amount: "NPR 800",   status: "Refunded" },
];

const STATUS_STYLE = {
  Confirmed: { background: "#f0fdf4", color: "#16a34a" },
  Completed: { background: "#eff6ff", color: "#2563eb" },
  Cancelled: { background: "#fff0f0", color: "#e11d48" },
  Paid:      { background: "#f0fdf4", color: "#16a34a" },
  Refunded:  { background: "#fefce8", color: "#ca8a04" },
};

const MENU = [
  { id: "dashboard", icon: "fa-gauge",       label: "Dashboard"       },
  { id: "bookings",  icon: "fa-ticket",      label: "My Bookings"     },
  { id: "payments",  icon: "fa-credit-card", label: "Payment History" },
  { id: "feedback",  icon: "fa-star",        label: "Feedback"        },
  { id: "profile",   icon: "fa-user",        label: "My Profile"      },
  { id: "support",   icon: "fa-headset",     label: "Support"         },
];

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toISOString().slice(0, 10);
};

const normalizeBookingStatus = (status) => {
  const normalized = String(status || "").toLowerCase().trim();

  if (normalized === "booked" || normalized === "paid") return "Confirmed";
  if (normalized === "completed") return "Completed";
  if (normalized === "cancelled") return "Cancelled";
  return "Confirmed";
};

const mapBookingToUi = (booking) => ({
  id: `#BK${String(booking.id).padStart(3, "0")}`,
  rawId: booking.id,
  tripId: booking.trip_id,
  from: String(booking.route_name || "Unknown Route").split("->")[0]?.trim() || "Unknown",
  to: String(booking.route_name || "Unknown Route").split("->")[1]?.trim() || "Destination",
  date: formatDate(booking.trip_date),
  time: booking.departure_time || "-",
  type: booking.vehicle_number || "Bus",
  seats: booking.seat_number || 1,
  status: normalizeBookingStatus(booking.status),
  amount: "NPR -",
});

const mapPaymentToUi = (payment) => ({
  id: `#PAY${String(payment.id).padStart(3, "0")}`,
  booking: `#BK${String(payment.booking_id).padStart(3, "0")}`,
  date: formatDate(payment.created_at),
  method: payment.payment_method || "QR",
  amount: `NPR ${Number(payment.amount || 0).toLocaleString()}`,
  status: String(payment.status || "").toLowerCase() === "refunded" ? "Refunded" : "Paid",
});

export default function UserPanel() {
  const storedUser = getStoredUser();
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileForm, setProfileForm] = useState({
    name: storedUser?.name || USER.name,
    email: storedUser?.email || USER.email,
    phone: storedUser?.phone || USER.phone,
  });
  const [supportForm, setSupportForm] = useState({ subject: "", message: "" });
  const [supportSent, setSupportSent] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ trip: "", rating: 0, comment: "" });
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [myBookings, setMyBookings] = useState(MY_BOOKINGS);
  const [payments, setPayments] = useState(PAYMENTS);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [bookingsResponse, paymentsResponse] = await Promise.all([
          bookingApi.getMyBookings(),
          paymentApi.getMyPayments(),
        ]);

        if (cancelled) return;

        const bookings = Array.isArray(bookingsResponse?.data)
          ? bookingsResponse.data.map(mapBookingToUi)
          : [];
        const paymentRows = Array.isArray(paymentsResponse?.data)
          ? paymentsResponse.data.map(mapPaymentToUi)
          : [];

        if (bookings.length > 0) {
          setMyBookings(bookings);
        }

        if (paymentRows.length > 0) {
          setPayments(paymentRows);
        }
      } catch (err) {
        if (!cancelled) {
          setApiError(err.message || "Could not load account data from server.");
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackForm.trip || !feedbackForm.rating) return;

    const selectedBooking = myBookings.find((item) => item.id === feedbackForm.trip);
    if (!selectedBooking?.tripId) {
      setApiError("Trip information is missing for this booking.");
      return;
    }

    try {
      await feedbackApi.createFeedback({
        trip_id: selectedBooking.tripId,
        rating: feedbackForm.rating,
        comment: feedbackForm.comment,
      });
      setFeedbackSent(true);
    } catch (err) {
      setApiError(err.message || "Failed to submit feedback.");
    }
  };

  const handleCancelBooking = async (booking) => {
    if (!booking?.rawId) return;

    try {
      await bookingApi.cancelBooking(booking.rawId);
      setMyBookings((prev) => prev.map((item) => (
        item.rawId === booking.rawId ? { ...item, status: "Cancelled" } : item
      )));
    } catch (err) {
      setApiError(err.message || "Failed to cancel booking.");
    }
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
      <div style={{ width: sidebarOpen ? 240 : 70, background: "white", display: "flex", flexDirection: "column", transition: "width 0.3s", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100, overflow: "hidden", borderRight: "1px solid #eee" }}>
        <div style={{ padding: "20px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
          <img src={logo} alt="logo" style={{ width: 36, height: 36, objectFit: "contain", background: "white", borderRadius: 8, padding: 4, flexShrink: 0 }} />
          {sidebarOpen && <span style={{ fontWeight: 900, fontSize: 13, letterSpacing: "0.1em", fontFamily: "'Poppins', sans-serif", whiteSpace: "nowrap", color: "#111" }}>HAMRO SAWARI</span>}
        </div>

        {sidebarOpen && (
          <div style={{ padding: "14px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 10 }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140 }}>{profileForm.name}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>Passenger</p>
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
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "1.5px solid #eee", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#555", display: "flex", alignItems: "center", gap: 8 }}>
              <i className="fa-solid fa-house"></i> Home
            </button>
          </div>
        </div>

        <div style={{ flex: 1, padding: 28 }}>

          {apiError && (
            <div style={{ background: "#fff0f0", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#e11d48", display: "flex", alignItems: "center", gap: 6 }}>
                <i className="fa-solid fa-circle-exclamation"></i> {apiError}
              </p>
            </div>
          )}

          {/* DASHBOARD */}
          {active === "dashboard" && (
            <div>
              <div style={{ background: "#000", borderRadius: 20, padding: "32px 36px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, background: "rgba(255,255,255,0.03)", borderRadius: "50%" }} />
                <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 20 }}>
                  <div>
                    <p style={{ margin: "0 0 4px", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Welcome back,</p>
                    <h2 style={{ margin: "0 0 6px", color: "white", fontSize: 24, fontWeight: 900, fontFamily: "'Poppins', sans-serif" }}>{profileForm.name}</h2>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Member since {USER.joined}</p>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20, marginBottom: 28 }}>
                {[
                  { icon: "fa-ticket",       label: "Total Trips", value: myBookings.length,                                   color: "#000"    },
                  { icon: "fa-circle-check", label: "Completed",   value: myBookings.filter(b=>b.status==="Completed").length, color: "#2563eb" },
                  { icon: "fa-clock",        label: "Upcoming",    value: myBookings.filter(b=>b.status==="Confirmed").length, color: "#16a34a" },
                  { icon: "fa-xmark",        label: "Cancelled",   value: myBookings.filter(b=>b.status==="Cancelled").length, color: "#e11d48" },
                ].map(({ icon, label, value, color }) => (
                  <div key={label} style={{ background: "white", borderRadius: 16, padding: "22px 20px", border: "1.5px solid #eee" }}>
                    <div style={{ width: 42, height: 42, background: color, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                      <i className={`fa-solid ${icon}`} style={{ color: "white", fontSize: 17 }}></i>
                    </div>
                    <p style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 900, color: "#111", fontFamily: "'Poppins', sans-serif" }}>{value}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#999", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</p>
                  </div>
                ))}
              </div>

              <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Recent Bookings</h2>
                  <button onClick={() => setActive("bookings")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#555" }}>
                    View All <i className="fa-solid fa-arrow-right-long" style={{ marginLeft: 6 }}></i>
                  </button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr style={{ background: "#f9f9f9" }}>{["ID","Route","Date","Type","Seats","Status","Amount"].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
                    <tbody>
                      {myBookings.slice(0,3).map((b,i) => (
                        <tr key={b.id} style={{ borderTop: "1px solid #f0f0f0", background: i%2===0?"white":"#fafafa" }}>
                          <TD bold>{b.id}</TD>
                          <TD>{b.from} → {b.to}</TD>
                          <TD>{b.date} {b.time}</TD>
                          <TD>{b.type}</TD>
                          <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#111", textAlign: "center" }}>{b.seats}</td>
                          <td style={{ padding: "14px 16px" }}><span style={{ ...STATUS_STYLE[b.status], fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 50 }}>{b.status}</span></td>
                          <TD bold>{b.amount}</TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MY BOOKINGS */}
          {active === "bookings" && (
            <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #eee" }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>My Bookings</h2>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ background: "#f9f9f9" }}>{["ID","From","To","Date & Time","Type","Seats","Status","Amount","Action"].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
                  <tbody>
                    {myBookings.map((b,i) => (
                      <tr key={b.id} style={{ borderTop: "1px solid #f0f0f0", background: i%2===0?"white":"#fafafa" }}>
                        <TD bold>{b.id}</TD><TD bold>{b.from}</TD><TD bold>{b.to}</TD>
                        <TD>{b.date} · {b.time}</TD><TD>{b.type}</TD>
                        <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#111", textAlign: "center" }}>{b.seats}</td>
                        <td style={{ padding: "14px 16px" }}><span style={{ ...STATUS_STYLE[b.status], fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 50 }}>{b.status}</span></td>
                        <TD bold>{b.amount}</TD>
                        <td style={{ padding: "14px 16px" }}>
                          {b.status === "Confirmed" && <button onClick={() => handleCancelBooking(b)} style={{ background: "#fff0f0", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#e11d48" }}>Cancel</button>}
                          {b.status === "Completed" && <button style={{ background: "#f0fdf4", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#16a34a" }}>Review</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAYMENTS */}
          {active === "payments" && (
            <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #eee" }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Payment History</h2>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ background: "#f9f9f9" }}>{["Payment ID","Booking","Date","Method","Amount","Status"].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
                  <tbody>
                    {payments.map((p,i) => (
                      <tr key={p.id} style={{ borderTop: "1px solid #f0f0f0", background: i%2===0?"white":"#fafafa" }}>
                        <TD bold>{p.id}</TD><TD>{p.booking}</TD><TD>{p.date}</TD>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <i className="fa-solid fa-credit-card" style={{ color: "#bbb", fontSize: 13 }}></i>
                            <span style={{ fontSize: 13, color: "#555" }}>{p.method}</span>
                          </div>
                        </td>
                        <TD bold>{p.amount}</TD>
                        <td style={{ padding: "14px 16px" }}><span style={{ ...STATUS_STYLE[p.status], fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 50 }}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FEEDBACK */}
          {active === "feedback" && (
            <div style={{ maxWidth: 600 }}>
              <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", padding: 32 }}>
                <h2 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 900 }}>Rate Your Trip</h2>
                <p style={{ margin: "0 0 28px", fontSize: 13, color: "#999" }}>Your feedback helps us improve the service.</p>

                {feedbackSent ? (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <i className="fa-solid fa-circle-check" style={{ fontSize: 56, color: "#4ade80", display: "block", marginBottom: 16 }}></i>
                    <h3 style={{ margin: "0 0 8px", fontFamily: "'Poppins', sans-serif" }}>Thank You!</h3>
                    <p style={{ color: "#999", fontSize: 14 }}>Your feedback has been submitted successfully.</p>
                    <button onClick={() => { setFeedbackSent(false); setFeedbackForm({ trip: "", rating: 0, comment: "" }); }} style={{ marginTop: 20, background: "#000", color: "white", border: "none", borderRadius: 50, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Submit Another</button>
                  </div>
                ) : (
                  <>
                    {/* Select trip */}
                    <div style={{ marginBottom: 24 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Select Trip</label>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {myBookings.filter(b => b.status === "Completed").map(b => (
                          <button key={b.id} onClick={() => setFeedbackForm(f => ({ ...f, trip: b.id }))} style={{
                            padding: "14px 16px", borderRadius: 12, border: "1.5px solid", cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                            borderColor: feedbackForm.trip === b.id ? "#000" : "#eee",
                            background: feedbackForm.trip === b.id ? "#000" : "white",
                          }}>
                            <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: feedbackForm.trip === b.id ? "white" : "#111" }}>{b.from} → {b.to}</p>
                            <p style={{ margin: 0, fontSize: 12, color: feedbackForm.trip === b.id ? "rgba(255,255,255,0.5)" : "#aaa" }}>{b.id} · {b.date} · {b.type}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Star rating */}
                    <div style={{ marginBottom: 24 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Overall Rating</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        {[1,2,3,4,5].map(star => (
                          <i key={star} className="fa-solid fa-star"
                            onMouseEnter={() => setFeedbackHover(star)}
                            onMouseLeave={() => setFeedbackHover(0)}
                            onClick={() => setFeedbackForm(f => ({ ...f, rating: star }))}
                            style={{ fontSize: 36, cursor: "pointer", color: star <= (feedbackHover || feedbackForm.rating) ? "#facc15" : "#e5e5e5", transition: "all 0.15s", transform: star <= (feedbackHover || feedbackForm.rating) ? "scale(1.2)" : "scale(1)" }}
                          ></i>
                        ))}
                      </div>
                      {feedbackForm.rating > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                          <i className={`fa-solid ${["","fa-thumbs-down","fa-minus","fa-thumbs-up","fa-heart","fa-star"][feedbackForm.rating]}`}
                            style={{ fontSize: 16, color: ["","#ef4444","#f59e0b","#22c55e","#3b82f6","#facc15"][feedbackForm.rating] }}></i>
                          <span style={{ fontSize: 13, color: "#999", fontStyle: "italic" }}>
                            {["","Poor","Fair","Good","Very Good","Excellent"][feedbackForm.rating]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Rating categories */}
                    <div style={{ marginBottom: 24 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Rate Categories</label>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {[
                          { label: "Driver Behavior" },
                          { label: "Bus Cleanliness" },
                          { label: "Punctuality"     },
                          { label: "Comfort"         },
                        ].map(({ label }) => (
                          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 13, color: "#555", fontWeight: 600 }}>{label}</span>
                            <div style={{ display: "flex", gap: 4 }}>
                              {[1,2,3,4,5].map(s => (
                                <i key={s} className="fa-solid fa-star" style={{ fontSize: 18, cursor: "pointer", color: s <= 4 ? "#facc15" : "#e5e5e5" }}></i>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Comment */}
                    <div style={{ marginBottom: 28 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Your Comment</label>
                      <textarea placeholder="Tell us about your experience..." rows={4} value={feedbackForm.comment}
                        onChange={e => setFeedbackForm(f => ({ ...f, comment: e.target.value }))}
                        style={{ width: "100%", border: "none", borderBottom: "1.5px solid #ddd", background: "transparent", padding: "8px 0", fontSize: 14, outline: "none", fontFamily: "inherit", resize: "none", color: "#222", boxSizing: "border-box" }} />
                    </div>

                    <button onClick={handleSubmitFeedback} style={{
                      width: "100%", background: "#000", color: "white", border: "none", borderRadius: 50,
                      padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    }}>
                      Submit Feedback <i className="fa-solid fa-arrow-right-long"></i>
                    </button>
                  </>
                )}
              </div>

              {/* Cancellation policy */}
              <div style={{ background: "#fefce8", borderRadius: 16, border: "1.5px solid #fde68a", padding: 24, marginTop: 20 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ color: "#ca8a04", fontSize: 18, marginTop: 2, flexShrink: 0 }}></i>
                  <div>
                    <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 900, color: "#92400e" }}>Cancellation Policy</h4>
                    <p style={{ margin: "0 0 6px", fontSize: 13, color: "#78350f", lineHeight: 1.6 }}>Free cancellation up to 24 hours before departure.</p>
                    <p style={{ margin: 0, fontSize: 13, color: "#78350f", lineHeight: 1.6 }}>If you cancel or request a refund 3 or more times, a <strong>Rs. 10 fine</strong> will be applied and service access may be restricted.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE */}
          {active === "profile" && (
            <div style={{ maxWidth: 600 }}>
              <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", padding: 32, marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32, paddingBottom: 28, borderBottom: "1px solid #f0f0f0" }}>
                  <div style={{ position: "relative" }}>
                   
                    <button style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, background: "#000", border: "2px solid white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <i className="fa-solid fa-pen" style={{ color: "white", fontSize: 11 }}></i>
                    </button>
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 900 }}>{USER.name}</h3>
                    
                  </div>
                </div>
                <h3 style={{ margin: "0 0 20px", fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444" }}>Personal Info</h3>
                {[
                  { label: "Full Name", field: "name",  icon: "fa-person",  type: "text"  },
                  { label: "Email",     field: "email", icon: "fa-envelope", type: "email" },
                  { label: "Phone",     field: "phone", icon: "fa-phone",    type: "tel"   },
                ].map(({ label, field, icon, type }) => (
                  <div key={field} style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{label}</label>
                    <div style={{ position: "relative", display: "flex", alignItems: "center", borderBottom: "1.5px solid #ddd" }}>
                      <i className={`fa-solid ${icon}`} style={{ position: "absolute", left: 2, color: "#bbb", fontSize: 13 }}></i>
                      <input type={type} value={profileForm[field]}
                        onChange={e => setProfileForm(f => ({ ...f, [field]: e.target.value }))}
                        style={{ flex: 1, border: "none", background: "transparent", padding: "8px 8px 8px 28px", fontSize: 14, outline: "none", fontFamily: "inherit", color: "#222" }} />
                    </div>
                  </div>
                ))}
                <button style={{ background: "#000", color: "white", border: "none", borderRadius: 50, padding: "12px 28px", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 8 }}>Save Changes</button>
              </div>

              <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", padding: 32 }}>
                <h3 style={{ margin: "0 0 20px", fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444" }}>Change Password</h3>
                {["Current Password","New Password","Confirm Password"].map(label => (
                  <div key={label} style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{label}</label>
                    <div style={{ position: "relative", display: "flex", alignItems: "center", borderBottom: "1.5px solid #ddd" }}>
                      <i className="fa-solid fa-lock" style={{ position: "absolute", left: 2, color: "#bbb", fontSize: 13 }}></i>
                      <input type="password" placeholder="••••••••" style={{ flex: 1, border: "none", background: "transparent", padding: "8px 8px 8px 28px", fontSize: 14, outline: "none", fontFamily: "inherit", color: "#222" }} />
                    </div>
                  </div>
                ))}
                <button style={{ background: "#000", color: "white", border: "none", borderRadius: 50, padding: "12px 28px", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 8 }}>Update Password</button>
              </div>
            </div>
          )}

          {/* SUPPORT */}
          {active === "support" && (
            <div style={{ maxWidth: 640 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
                {[
                  { icon: "fa-ticket",      title: "Booking Issues",  desc: "Problems with your reservation" },
                  { icon: "fa-credit-card", title: "Payment Support", desc: "Refunds and payment queries"    },
                  { icon: "fa-bus",         title: "Route Info",      desc: "Schedule and route questions"   },
                  { icon: "fa-headset",     title: "General Help",    desc: "Any other questions"            },
                ].map(({ icon, title, desc }) => (
                  <div key={title} style={{ background: "white", borderRadius: 14, padding: "20px 18px", border: "1.5px solid #eee", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.border = "1.5px solid black"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.border = "1.5px solid #eee"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <div style={{ width: 40, height: 40, background: "#000", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                      <i className={`fa-solid ${icon}`} style={{ color: "white", fontSize: 16 }}></i>
                    </div>
                    <h4 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>{title}</h4>
                    <p style={{ margin: 0, fontSize: 12, color: "#999" }}>{desc}</p>
                  </div>
                ))}
              </div>

              <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", padding: 32 }}>
                <h2 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 900 }}>Send a Message</h2>
                <p style={{ margin: "0 0 24px", fontSize: 13, color: "#999" }}>We will get back to you within 24 hours.</p>
                {supportSent ? (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <i className="fa-solid fa-circle-check" style={{ fontSize: 48, color: "#4ade80", display: "block", marginBottom: 16 }}></i>
                    <h3 style={{ margin: "0 0 8px", fontFamily: "'Poppins', sans-serif" }}>Message Sent!</h3>
                    <p style={{ color: "#999", fontSize: 14 }}>Our team will respond within 24 hours.</p>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Subject</label>
                      <div style={{ position: "relative", display: "flex", alignItems: "center", borderBottom: "1.5px solid #ddd" }}>
                        <i className="fa-solid fa-tag" style={{ position: "absolute", left: 2, color: "#bbb", fontSize: 13 }}></i>
                        <input type="text" placeholder="What do you need help with?" value={supportForm.subject}
                          onChange={e => setSupportForm(f => ({ ...f, subject: e.target.value }))}
                          style={{ flex: 1, border: "none", background: "transparent", padding: "8px 8px 8px 28px", fontSize: 14, outline: "none", fontFamily: "inherit", color: "#222" }} />
                      </div>
                    </div>
                    <div style={{ marginBottom: 24 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Message</label>
                      <textarea placeholder="Describe your issue in detail..." rows={5} value={supportForm.message}
                        onChange={e => setSupportForm(f => ({ ...f, message: e.target.value }))}
                        style={{ width: "100%", border: "none", borderBottom: "1.5px solid #ddd", background: "transparent", padding: "8px 0", fontSize: 14, outline: "none", fontFamily: "inherit", resize: "none", color: "#222", boxSizing: "border-box" }} />
                    </div>
                    <button onClick={() => { if (supportForm.subject && supportForm.message) setSupportSent(true); }} style={{ background: "#000", color: "white", border: "none", borderRadius: 50, padding: "13px 28px", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 10 }}>
                      Send Message <i className="fa-solid fa-arrow-right-long"></i>
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