import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/images/styles/OIP.webp";
import paymentQR from "../assets/images/styles/Screenshot 2026-03-24 212532.png";   // ← Add this
import { paymentApi } from "../services/api";

const PAYMENT_METHODS = [
  { id: "esewa",  label: "eSewa",  icon: "fa-mobile-screen", color: "#60bb46", desc: "Pay with eSewa digital wallet"    },
  { id: "khalti", label: "Khalti", icon: "fa-mobile-screen", color: "#5c2d91", desc: "Pay with Khalti digital wallet"   },
  { id: "qr",     label: "Bank QR",icon: "fa-qrcode",        color: "#2563eb", desc: "Scan any bank QR code to pay"    },
  { id: "cash",   label: "Cash",   icon: "fa-money-bill",    color: "#16a34a", desc: "Pay cash while boarding the bus" },
];

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state || {
    from: "Kathmandu", to: "Pokhara", date: "2025-03-20", time: "06:00 AM",
    busType: "Deluxe AC", seats: ["3B","3C"], passenger: { name: "Ram Sharma", phone: "+977-9800000001" },
    fare: 2856,
  };

  const [method, setMethod] = useState("");
  const [esewaId, setEsewaId] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  const [bookingRef] = useState(() => "HS" + Math.floor(Math.random() * 900000 + 100000));

  const handlePay = async () => {
    if (!method) { setError("Please select a payment method."); return; }
    if (method === "esewa" && !esewaId) { setError("Please enter your eSewa ID."); return; }
    if (!agreed) { setError("Please agree to the terms and conditions."); return; }

    setError("");
    setLoading(true);

    try {
      const bookingIds = Array.isArray(booking.bookingIds) ? booking.bookingIds : [];

      if (bookingIds.length > 0) {
        const normalizedPaymentMethod = method === "cash" ? "cash" : "QR";
        const amountPerBooking = Number(booking.farePerBooking || 0) || Math.round(Number(booking.fare || 0) / bookingIds.length);

        await Promise.all(
          bookingIds.map((bookingId) =>
            paymentApi.createPayment({
              booking_id: bookingId,
              amount: amountPerBooking,
              payment_method: normalizedPaymentMethod,
            })
          )
        );
      }

      setConfirmed(true);
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div style={{ minHeight: "100vh", width: "100%", background: "#f5f5f5", fontFamily: "'Poppins', sans-serif", display: "flex", flexDirection: "column" }}>
        <nav style={{ background: "#000", padding: "14px 24px", display: "flex", alignItems: "center", gap: 10 }}>
          <img src={logo} alt="logo" style={{ width: 36, height: 36, objectFit: "contain", background: "white", borderRadius: 8, padding: 4 }} />
          <span style={{ color: "white", fontWeight: 900, fontSize: 16, letterSpacing: "0.12em", fontFamily: "'Poppins', sans-serif" }}>HAMRO SAWARI</span>
        </nav>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "white", borderRadius: 20, border: "1.5px solid #eee", padding: "48px 40px", maxWidth: 480, width: "100%", textAlign: "center" }}>
            <div style={{ width: 80, height: 80, background: "#f0fdf4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: 40, color: "#16a34a" }}></i>
            </div>
            <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 28, fontWeight: 900, margin: "0 0 8px", color: "#111" }}>Booking Confirmed!</h1>
            <p style={{ color: "#999", fontSize: 14, margin: "0 0 32px" }}>Your seats have been successfully booked.</p>

            <div style={{ background: "#f9f9f9", borderRadius: 12, padding: 20, marginBottom: 24, textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "#999", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Booking Ref</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: "#111" }}>{bookingRef}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "#999", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Route</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{booking.from} → {booking.to}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "#999", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Date & Time</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{booking.date} · {booking.time}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "#999", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Seats</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {booking.seats?.map(s => (
                    <span key={s} style={{ background: "#000", color: "white", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 5 }}>{s}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #eee" }}>
                <span style={{ fontSize: 12, color: "#999", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Paid</span>
                <span style={{ fontSize: 15, fontWeight: 900, color: "#111" }}>NPR {booking.fare?.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: 12, marginBottom: 24, textAlign: "left" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ color: "#ca8a04", fontSize: 13, marginTop: 1 }}></i>
                <p style={{ margin: 0, fontSize: 12, color: "#a16207", lineHeight: 1.6 }}>
                  Show your booking reference <strong>{bookingRef}</strong> to the driver when boarding. Free cancellation up to 24hrs before departure.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => navigate("/")} style={{ flex: 1, background: "#f5f5f5", color: "#333", border: "none", borderRadius: 50, padding: "13px", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Back to Home
              </button>
              <button onClick={() => navigate("/dashboard")} style={{ flex: 1, background: "#000", color: "white", border: "none", borderRadius: 50, padding: "13px", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                My Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: "#f5f5f5", fontFamily: "'Poppins', sans-serif", overflowX: "hidden" }}>

      {/* Navbar */}
      <nav style={{ background: "#000", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/")}>
          <img src={logo} alt="logo" style={{ width: 36, height: 36, objectFit: "contain", background: "white", borderRadius: 8, padding: 4 }} />
          <span style={{ color: "white", fontWeight: 900, fontSize: 16, letterSpacing: "0.12em", fontFamily: "'Poppins', sans-serif" }}>HAMRO SAWARI</span>
        </div>
        <button onClick={() => navigate(-1)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
      </nav>

      {/* Steps */}
      <div style={{ background: "white", borderBottom: "1px solid #f0f0f0", padding: "12px 24px" }}>
        <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 8 }}>
          {[["1","Select Seats"],["2","Payment"],["3","Confirmation"]].map(([num, label], i) => (
            <div key={num} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 1 ? "#000" : i === 0 ? "#4ade80" : "#f0f0f0", color: i < 2 ? "white" : "#bbb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 }}>
                {i === 0 ? <i className="fa-solid fa-check" style={{ fontSize: 11 }}></i> : num}
              </div>
              <span style={{ fontSize: 13, fontWeight: i === 1 ? 700 : 400, color: i === 1 ? "#111" : i === 0 ? "#16a34a" : "#bbb" }}>{label}</span>
              {i < 2 && <i className="fa-solid fa-chevron-right" style={{ color: "#ddd", fontSize: 11, margin: "0 4px" }}></i>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: "100%", margin: "0", padding: "24px 32px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, boxSizing: "border-box" }}>

        {/* LEFT - Payment methods */}
        <div>
          <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", padding: 28, marginBottom: 20 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 900 }}>Choose Payment Method</h2>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "#999" }}>Select how you want to pay for your booking</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
              {PAYMENT_METHODS.map(({ id, label, icon, color, desc }) => (
                <button key={id} onClick={() => { setMethod(id); setError(""); }} style={{
                  padding: "18px 16px", borderRadius: 14, textAlign: "left",
                  border: method === id ? `2px solid ${color}` : "1.5px solid #eee",
                  background: method === id ? `${color}08` : "white",
                  cursor: "pointer", transition: "all 0.2s",
                }}>
                  <div style={{ width: 40, height: 40, background: method === id ? color : "#f5f5f5", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, transition: "all 0.2s" }}>
                    <i className={`fa-solid ${icon}`} style={{ fontSize: 18, color: method === id ? "white" : "#999" }}></i>
                  </div>
                  <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 900, color: "#111" }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#999", lineHeight: 1.4 }}>{desc}</p>
                  {method === id && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
                      <i className="fa-solid fa-circle-check" style={{ color, fontSize: 12 }}></i>
                      <span style={{ fontSize: 11, color, fontWeight: 700 }}>Selected</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* eSewa form */}
            {method === "esewa" && (
              <div style={{ background: "#f0fef4", border: "1.5px solid #bbf7d0", borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, background: "#60bb46", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="fa-solid fa-mobile-screen" style={{ color: "white", fontSize: 16 }}></i>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 900, fontSize: 14 }}>Pay with eSewa</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#999" }}>Enter your eSewa registered phone number</p>
                  </div>
                </div>
                <label style={lSt}>eSewa ID / Phone Number</label>
                <div style={fWr}>
                  <i className="fa-solid fa-phone" style={iL}></i>
                  <input type="tel" placeholder="+977 XXXXXXXXXX" value={esewaId} onChange={e => setEsewaId(e.target.value)} style={iSt} />
                </div>
                <p style={{ margin: "10px 0 0", fontSize: 11, color: "#16a34a" }}>
                  <i className="fa-solid fa-shield-halved" style={{ marginRight: 4 }}></i>
                  Secured by eSewa payment gateway
                </p>
              </div>
            )}

            {/* Khalti QR */}
            {method === "khalti" && (
              <div style={{ background: "#faf5ff", border: "1.5px solid #e9d5ff", borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, background: "#5c2d91", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="fa-solid fa-qrcode" style={{ color: "white", fontSize: 16 }}></i>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 900, fontSize: 14 }}>Pay with Khalti</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#999" }}>Scan the QR code with your Khalti app</p>
                  </div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <img
                    src={paymentQR}
                    alt="Khalti QR Code"
                    style={{ 
                      width: 200, 
                      height: 200, 
                      objectFit: "contain", 
                      borderRadius: 12, 
                      border: "1.5px solid #e9d5ff", 
                      padding: 8, 
                      background: "white" 
                    }}
                  />
                  <p style={{ margin: "12px 0 0", fontSize: 13, fontWeight: 700, color: "#5c2d91" }}>
                    Amount: NPR {booking.fare?.toLocaleString()}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "#999" }}>
                    Open Khalti app → Scan QR → Pay
                  </p>
                </div>

                <p style={{ margin: "12px 0 0", fontSize: 11, color: "#5c2d91" }}>
                  <i className="fa-solid fa-shield-halved" style={{ marginRight: 4 }}></i>
                  Secured by Khalti payment gateway
                </p>
              </div>
            )}

            {/* Bank QR - Same image as requested */}
            {method === "qr" && (
              <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, background: "#2563eb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="fa-solid fa-qrcode" style={{ color: "white", fontSize: 16 }}></i>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 900, fontSize: 14 }}>Bank QR Payment</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#999" }}>Scan this QR code with any bank app (Esewa, Khalti, IME Pay, ConnectIPS, etc.)</p>
                  </div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <img
                    src={paymentQR}
                    alt="Bank QR Code"
                    style={{ 
                      width: 200, 
                      height: 200, 
                      objectFit: "contain", 
                      borderRadius: 12, 
                      border: "1.5px solid #bfdbfe", 
                      padding: 8, 
                      background: "white" 
                    }}
                  />
                  <p style={{ margin: "12px 0 0", fontSize: 13, fontWeight: 700, color: "#2563eb" }}>
                    Amount: NPR {booking.fare?.toLocaleString()}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "#999" }}>
                    Open any banking app → Scan QR → Pay
                  </p>
                </div>

                <p style={{ margin: "12px 0 0", fontSize: 11, color: "#2563eb" }}>
                  <i className="fa-solid fa-shield-halved" style={{ marginRight: 4 }}></i>
                  Any Nepali bank / wallet app supported
                </p>
              </div>
            )}

            {/* Cash info */}
            {method === "cash" && (
              <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <i className="fa-solid fa-money-bill" style={{ color: "#16a34a", fontSize: 20, marginTop: 2 }}></i>
                  <div>
                    <p style={{ margin: "0 0 6px", fontWeight: 900, fontSize: 14 }}>Pay Cash on Board</p>
                    <p style={{ margin: "0 0 8px", fontSize: 13, color: "#555", lineHeight: 1.6 }}>
                      You can pay NPR <strong>{booking.fare?.toLocaleString()}</strong> directly to the driver when you board the bus.
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: "#16a34a", fontWeight: 600 }}>
                      <i className="fa-solid fa-circle-info" style={{ marginRight: 4 }}></i>
                      Show your booking reference <strong>({bookingRef})</strong> when boarding.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Terms */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 8 }}>
              <input type="checkbox" checked={agreed} onChange={e => { setAgreed(e.target.checked); setError(""); }} style={{ accentColor: "#000", marginTop: 2, flexShrink: 0, width: 14, height: 14 }} />
              <span style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>
                I agree to the{" "}
                <span style={{ color: "#000", fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}>Terms of Service</span>
                {" "}and understand the cancellation policy. After 3 cancellations, a <strong>Rs.10 fine</strong> will be applied.
              </span>
            </label>

            {error && (
              <div style={{ background: "#fff0f0", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", marginBottom: 14, marginTop: 14 }}>
                <p style={{ margin: 0, fontSize: 12, color: "#e11d48", display: "flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-circle-exclamation"></i> {error}
                </p>
              </div>
            )}

            <button onClick={handlePay} disabled={loading} style={{
              width: "100%", background: loading ? "#555" : "#000", color: "white", border: "none",
              borderRadius: 50, padding: "15px", fontSize: 14, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.08em", textTransform: "uppercase",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "background 0.2s", marginTop: 20,
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#222"; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#000"; }}
            >
              {loading ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Processing...</>
              ) : (
                <>{method === "cash" ? "Confirm Booking" : "Confirm Payment"} <i className="fa-solid fa-arrow-right-long"></i></>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT - Order summary */}
        <div>
          <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", padding: 24, position: "sticky", top: 80 }}>
            <h2 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 900 }}>Order Summary</h2>

            <div style={{ background: "#f9f9f9", borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 900 }}>{booking.from}</span>
                <i className="fa-solid fa-arrow-right-long" style={{ color: "#bbb" }}></i>
                <span style={{ fontWeight: 900 }}>{booking.to}</span>
              </div>
              <div style={{ fontSize: 12, color: "#999" }}>{booking.date} · {booking.time}</div>
              <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{booking.busType}</div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>Seats</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {booking.seats?.map(s => (
                  <span key={s} style={{ background: "#000", color: "white", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6 }}>{s}</span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>Passenger</p>
              <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700 }}>{booking.passenger?.name}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#999" }}>{booking.passenger?.phone}</p>
            </div>

            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 14, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 15, fontWeight: 900 }}>Total</span>
                <span style={{ fontSize: 15, fontWeight: 900 }}>NPR {booking.fare?.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ background: "#f9f9f9", borderRadius: 10, padding: 12 }}>
              <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase" }}>Booking Ref</p>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 900, letterSpacing: "0.1em", color: "#111" }}>{bookingRef}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const lSt = { display: "block", fontSize: 11, fontWeight: 700, marginBottom: 8, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase" };
const fWr = { position: "relative", display: "flex", alignItems: "center", borderBottom: "1.5px solid #ddd", marginBottom: 2 };
const iSt = { flex: 1, border: "none", background: "transparent", padding: "8px 8px 8px 28px", fontSize: 14, outline: "none", color: "#222", fontFamily: "inherit" };
const iL  = { position: "absolute", left: 2, color: "#bbb", fontSize: 13, pointerEvents: "none" };