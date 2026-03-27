import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/images/styles/OIP.webp";
import { bookingApi } from "../services/api";

const FARE_MAP = {
  "Standard":      800,
  "Express":       1100,
  "Deluxe AC":     1400,
  "Tourist Coach": 1800,
};

const DEFAULT_BOOKED_SEATS = ["1A","1B","2C","3A","4B","4C","5D","6A","6B","7C","8A","9B","9C","10D"];

export default function SeatBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const trip = location.state || {
    from: "Kathmandu", to: "Pokhara", date: "2025-03-20",
    time: "06:00 AM", passengers: "2", busType: "Deluxe AC",
  };

  const baseFare = FARE_MAP[trip.busType] || 1000;
  const maxSeats = parseInt(trip.passengers) || 1;

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passenger, setPassenger] = useState({ name: "", phone: "", email: "" });
  const [error, setError] = useState("");
  const [bookedSeats, setBookedSeats] = useState(DEFAULT_BOOKED_SEATS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tripId = Number(trip?.tripId || 0) || null;

  const getSeatId = (row, col) => `${row}${"ABCD"[col]}`;

  const getSeatNumber = (seatId) => {
    const row = Number(seatId.slice(0, -1));
    const letter = seatId.slice(-1);
    const col = "ABCD".indexOf(letter);

    if (!row || col < 0) return null;
    return ((row - 1) * 4) + col + 1;
  };

  const getSeatLabelFromNumber = (seatNumber) => {
    const value = Number(seatNumber);
    if (!value || value < 1) return null;

    const row = Math.ceil(value / 4);
    const colIndex = (value - 1) % 4;
    return `${row}${"ABCD"[colIndex]}`;
  };

  useEffect(() => {
    let cancelled = false;

    const loadBookedSeats = async () => {
      if (!tripId) {
        setBookedSeats(DEFAULT_BOOKED_SEATS);
        return;
      }

      try {
        const response = await bookingApi.getBookedSeats(tripId);
        const seats = Array.isArray(response?.data)
          ? response.data
              .map((entry) => getSeatLabelFromNumber(entry.seat_number))
              .filter(Boolean)
          : [];

        if (!cancelled) {
          setBookedSeats(seats);
        }
      } catch {
        if (!cancelled) {
          setBookedSeats(DEFAULT_BOOKED_SEATS);
        }
      }
    };

    loadBookedSeats();

    return () => {
      cancelled = true;
    };
  }, [tripId]);

  const toggleSeat = (seatId) => {
    if (bookedSeats.includes(seatId)) return;
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
      setError("");
    } else {
      if (selectedSeats.length >= maxSeats) {
        setError(`You can only select ${maxSeats} seat(s).`);
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
      setError("");
    }
  };

  const getSeatStatus = (seatId) => {
    if (bookedSeats.includes(seatId)) return "booked";
    if (selectedSeats.includes(seatId)) return "selected";
    return "available";
  };

  const seatStyle = (status) => {
    if (status === "booked")   return { background: "#f0f0f0", border: "1.5px solid #e5e5e5", color: "#ccc", cursor: "not-allowed" };
    if (status === "selected") return { background: "#000", border: "1.5px solid #000", color: "white", cursor: "pointer" };
    return { background: "white", border: "1.5px solid #ddd", color: "#444", cursor: "pointer" };
  };

  const totalFare   = baseFare * selectedSeats.length;
  const serviceFee  = Math.round(totalFare * 0.02);
  const grandTotal  = totalFare + serviceFee;

  const handleProceed = async () => {
    if (selectedSeats.length < maxSeats) { setError(`Please select ${maxSeats} seat(s).`); return; }
    if (!passenger.name || !passenger.phone) { setError("Please fill your name and phone number."); return; }

    if (!tripId) {
      navigate("/payment", { state: { ...trip, seats: selectedSeats, passenger, fare: grandTotal } });
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const bookingResponses = await Promise.all(
        selectedSeats.map((seatLabel) => {
          const seatNumber = getSeatNumber(seatLabel);
          return bookingApi.createBooking({
            trip_id: tripId,
            seat_number: seatNumber,
          });
        })
      );

      const bookingIds = bookingResponses
        .map((response) => response?.data?.id)
        .filter(Boolean);

      navigate("/payment", {
        state: {
          ...trip,
          seats: selectedSeats,
          passenger,
          fare: grandTotal,
          bookingIds,
          farePerBooking: Math.round(grandTotal / selectedSeats.length),
        },
      });
    } catch (err) {
      setError(err.message || "Could not create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "#f5f5f5", fontFamily: "'Poppins', sans-serif" }}>

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

      {/* Trip Info Bar */}
      <div style={{ background: "white", borderBottom: "1px solid #eee", padding: "14px 24px" }}>
        <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontWeight: 900, fontSize: 16 }}>{trip.from}</span>
            <i className="fa-solid fa-arrow-right-long" style={{ color: "#bbb" }}></i>
            <span style={{ fontWeight: 900, fontSize: 16 }}>{trip.to}</span>
          </div>
          {[
            { icon: "fa-calendar", val: trip.date },
            { icon: "fa-clock",    val: trip.time },
            { icon: "fa-bus",      val: trip.busType },
            { icon: "fa-users",    val: `${trip.passengers} Passenger(s)` },
          ].map(({ icon, val }) => (
            <div key={val} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <i className={`fa-solid ${icon}`} style={{ color: "#bbb", fontSize: 12 }}></i>
              <span style={{ fontSize: 13, color: "#555", fontWeight: 600 }}>{val}</span>
            </div>
          ))}
          <div style={{ marginLeft: "auto", fontWeight: 900, fontSize: 15 }}>
            NPR {baseFare.toLocaleString()} <span style={{ fontWeight: 400, color: "#999", fontSize: 12 }}>/ seat</span>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div style={{ background: "white", borderBottom: "1px solid #f0f0f0", padding: "12px 24px" }}>
        <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 8 }}>
          {[["1","Select Seats"],["2","Payment"],["3","Confirmation"]].map(([num, label], i) => (
            <div key={num} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? "#000" : "#f0f0f0", color: i === 0 ? "white" : "#bbb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 }}>{num}</div>
              <span style={{ fontSize: 13, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? "#111" : "#bbb" }}>{label}</span>
              {i < 2 && <i className="fa-solid fa-chevron-right" style={{ color: "#ddd", fontSize: 11, margin: "0 4px" }}></i>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: "100%", padding: "24px 32px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, boxSizing: "border-box" }}>

        {/* LEFT */}
        <div>
          {/* Seat Map */}
          <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", padding: 28, marginBottom: 20 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 900 }}>Select Your Seat</h2>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#999" }}>Select {maxSeats} seat(s) — {selectedSeats.length} selected</p>

            {/* Legend */}
            <div style={{ display: "flex", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
              {[["white","#ddd","Available"],["#000","#000","Selected"],["#f0f0f0","#e5e5e5","Booked"]].map(([bg, border, label]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 18, height: 18, background: bg, border: `1.5px solid ${border}`, borderRadius: 4 }}></div>
                  <span style={{ fontSize: 12, color: "#666" }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Bus front */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{ background: "#f5f5f5", border: "1.5px solid #eee", borderRadius: 50, padding: "6px 24px", display: "flex", alignItems: "center", gap: 8 }}>
                <i className="fa-solid fa-bus" style={{ color: "#999", fontSize: 13 }}></i>
                <span style={{ fontSize: 11, color: "#999", fontWeight: 700, letterSpacing: "0.1em" }}>FRONT</span>
              </div>
            </div>

            {/* Column labels */}
            <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 20px 1fr", gap: 8, marginBottom: 8 }}>
              <div></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {["A","B"].map(c => <div key={c} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#bbb" }}>{c}</div>)}
              </div>
              <div></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {["C","D"].map(c => <div key={c} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#bbb" }}>{c}</div>)}
              </div>
            </div>

            {/* Seat rows */}
            {Array.from({ length: 10 }, (_, row) => (
              <div key={row} style={{ display: "grid", gridTemplateColumns: "28px 1fr 20px 1fr", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "#bbb", fontWeight: 700, textAlign: "center" }}>{row + 1}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[0,1].map(col => {
                    const id = getSeatId(row+1, col);
                    const st = getSeatStatus(id);
                    return (
                      <button key={id} onClick={() => toggleSeat(id)} style={{ ...seatStyle(st), borderRadius: 8, padding: "8px 4px", fontSize: 10, fontWeight: 700, transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2 }}>
                        <i className="fa-solid fa-couch" style={{ fontSize: 14 }}></i>
                        <span>{id}</span>
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div style={{ width: 1, height: 36, background: "#f0f0f0" }}></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[2,3].map(col => {
                    const id = getSeatId(row+1, col);
                    const st = getSeatStatus(id);
                    return (
                      <button key={id} onClick={() => toggleSeat(id)} style={{ ...seatStyle(st), borderRadius: 8, padding: "8px 4px", fontSize: 10, fontWeight: 700, transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2 }}>
                        <i className="fa-solid fa-couch" style={{ fontSize: 14 }}></i>
                        <span>{id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Passenger Details */}
          <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", padding: 28 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 900 }}>Passenger Details</h2>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "#999" }}>Enter details for the primary passenger</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div>
                <label style={lSt}>Full Name</label>
                <div style={fWr}>
                  <i className="fa-solid fa-person" style={iL}></i>
                  <input type="text" placeholder="Your full name" value={passenger.name} onChange={e => setPassenger(p => ({ ...p, name: e.target.value }))} style={iSt} />
                </div>
              </div>
              <div>
                <label style={lSt}>Phone Number</label>
                <div style={fWr}>
                  <i className="fa-solid fa-phone" style={iL}></i>
                  <input type="tel" placeholder="+977 XXXXXXXXXX" value={passenger.phone} onChange={e => setPassenger(p => ({ ...p, phone: e.target.value }))} style={iSt} />
                </div>
              </div>
            </div>
            <div>
              <label style={lSt}>Email (Optional)</label>
              <div style={fWr}>
                <i className="fa-solid fa-envelope" style={iL}></i>
                <input type="email" placeholder="your@email.com" value={passenger.email} onChange={e => setPassenger(p => ({ ...p, email: e.target.value }))} style={iSt} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - Summary */}
        <div>
          <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #eee", padding: 24, position: "sticky", top: 80 }}>
            <h2 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 900 }}>Booking Summary</h2>

            <div style={{ background: "#f9f9f9", borderRadius: 12, padding: 14, marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 900 }}>{trip.from}</span>
                <i className="fa-solid fa-arrow-right-long" style={{ color: "#bbb" }}></i>
                <span style={{ fontWeight: 900 }}>{trip.to}</span>
              </div>
              <div style={{ fontSize: 12, color: "#999" }}>{trip.date} · {trip.time}</div>
              <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{trip.busType}</div>
            </div>

            <p style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>Selected Seats</p>
            {selectedSeats.length === 0 ? (
              <p style={{ fontSize: 13, color: "#bbb", fontStyle: "italic", marginBottom: 16 }}>No seats selected</p>
            ) : (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                {selectedSeats.map(s => (
                  <span key={s} style={{ background: "#000", color: "white", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6 }}>{s}</span>
                ))}
              </div>
            )}

            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 14, marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#666" }}>NPR {baseFare.toLocaleString()} × {selectedSeats.length}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>NPR {totalFare.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#666" }}>Service Fee (2%)</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>NPR {serviceFee.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #f0f0f0" }}>
                <span style={{ fontSize: 15, fontWeight: 900 }}>Total</span>
                <span style={{ fontSize: 15, fontWeight: 900 }}>NPR {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Cancellation warning */}
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ color: "#ca8a04", fontSize: 13, marginTop: 1, flexShrink: 0 }}></i>
                <div>
                  <p style={{ margin: "0 0 3px", fontSize: 11, fontWeight: 700, color: "#92400e" }}>Cancellation Policy</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#a16207", lineHeight: 1.6 }}>
                    Free cancellation up to 24hrs before. After <strong>3 cancellations</strong>, a Rs.10 fine applies.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div style={{ background: "#fff0f0", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
                <p style={{ margin: 0, fontSize: 12, color: "#e11d48", display: "flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-circle-exclamation"></i> {error}
                </p>
              </div>
            )}

            <button onClick={handleProceed} disabled={isSubmitting} style={{ width: "100%", background: isSubmitting ? "#555" : "#000", color: "white", border: "none", borderRadius: 50, padding: "14px", fontSize: 14, fontWeight: 700, cursor: isSubmitting ? "not-allowed" : "pointer", letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#222"}
              onMouseLeave={e => e.currentTarget.style.background = "#000"}
            >
              {isSubmitting ? "Creating Booking..." : "Proceed to Payment"} <i className="fa-solid fa-arrow-right-long"></i>
            </button>

            <p style={{ textAlign: "center", fontSize: 11, color: "#bbb", marginTop: 10 }}>
              <i className="fa-solid fa-shield-halved" style={{ marginRight: 4 }}></i> Secured & encrypted
            </p>
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