import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/styles/OIP.webp";
import { getAuthToken, tripApi } from "../services/api";

const NAV_LINKS = ["Home", "Services", "About", "Contact"];

const CITIES = [
  "Kathmandu", "Pokhara", "Biratnagar", "Birgunj", "Lalitpur",
  "Bhaktapur", "Butwal", "Dharan", "Hetauda", "Janakpur",
];

const FEATURES = [
  { icon: "fa-bus",           title: "Reliable Service",   desc: "Safe, comfortable rides with verified professional drivers." },
  { icon: "fa-sack-dollar",   title: "Affordable Prices",  desc: "Best rates in the market with zero hidden charges." },
  { icon: "fa-bolt",          title: "Quick Booking",      desc: "Book your ride in under 30 seconds." },
  { icon: "fa-clock",         title: "24/7 Support",       desc: "Round-the-clock customer care, always available." },
  { icon: "fa-map",           title: "Wide Coverage",      desc: "Service available across all major cities in Nepal." },
  { icon: "fa-star",          title: "Rated Drivers",      desc: "Only top-rated, background-checked drivers." },
];

const BUS_TYPES = ["Standard", "Express", "Deluxe AC", "Tourist Coach"];

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

function Navbar({ scrolled }) {
  const handleNav = (link) => {
    const id = link.toLowerCase();
    if (id === "home") window.scrollTo({ top: 0, behavior: "smooth" });
    else scrollTo(id);
  };

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled ? "rgba(0,0,0,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.5)" : "none",
      padding: scrolled ? "12px 0" : "20px 0",
      transition: "all 0.4s ease",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={logo} alt="Hamro Sawari" style={{ width: 42, height: 42, objectFit: "contain", borderRadius: 8, background: "white", padding: 4 }} />
          <span style={{ color: "white", fontWeight: 900, fontSize: 20, letterSpacing: "0.15em", fontFamily: "'Poppins', sans-serif" }}>
            HAMRO SAWARI
          </span>
        </div>

        <ul style={{ display: "flex", gap: 32, listStyle: "none", margin: 0, padding: 0 }}>
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <button onClick={() => handleNav(link)} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600,
                letterSpacing: "0.1em", textTransform: "uppercase", padding: 0,
              }}
                onMouseEnter={e => e.target.style.color = "white"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.7)"}
              >{link}</button>
            </li>
          ))}
        </ul>

      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section id="home" style={{
      position: "relative", minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      overflow: "hidden", background: "#000",
    }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.08,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
      <div style={{ position: "absolute", top: "30%", left: "20%", width: 400, height: 400, background: "rgba(255,255,255,0.04)", borderRadius: "50%", filter: "blur(80px)" }} />
      <div style={{ position: "absolute", bottom: "30%", right: "20%", width: 250, height: 250, background: "rgba(255,255,255,0.04)", borderRadius: "50%", filter: "blur(60px)" }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 50, padding: "6px 16px", marginBottom: 32,
        }}>
          <span style={{ width: 8, height: 8, background: "#4ade80", borderRadius: "50%", display: "inline-block" }} />
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Nepal's Trusted Bus Network
          </span>
        </div>

        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "clamp(60px, 10vw, 100px)", fontWeight: 900, color: "white", lineHeight: 1, margin: "0 0 24px", letterSpacing: "-1px" }}>
          HAMRO<br />
          <span style={{ background: "linear-gradient(90deg, #fff, #aaa, #555)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            SAWARI
          </span>
        </h1>

        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 22, fontStyle: "italic", fontWeight: 300, letterSpacing: "0.05em", margin: "0 0 48px" }}>
          "Your journey, just one click away."
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => scrollTo("booking")} style={{
            background: "white", color: "black", border: "none",
            borderRadius: 50, padding: "16px 40px", fontSize: 17,
            fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em",
          }}
            onMouseEnter={e => { e.target.style.background = "#f0f0f0"; e.target.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.target.style.background = "white"; e.target.style.transform = "translateY(0)"; }}
          >Book Your Ride →</button>

          <button onClick={() => scrollTo("services")} style={{
            background: "transparent", color: "white",
            border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: 50, padding: "16px 40px", fontSize: 17,
            fontWeight: 600, cursor: "pointer", letterSpacing: "0.05em",
          }}
            onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={e => { e.target.style.background = "transparent"; }}
          >Explore Services</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, maxWidth: 420, margin: "80px auto 0" }}>
          {[["50K+", "Rides/Month"], ["200+", "Routes"], ["4.9★", "Rating"]].map(([val, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ color: "white", fontSize: 26, fontWeight: 900, fontFamily: "'Poppins', sans-serif" }}>{val}</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}>Scroll</span>
        <div style={{ width: 1, height: 48, background: "linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)" }} />
      </div>
    </section>
  );
}

function BookingSection() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    from: "", to: "", date: "", time: "",
    passengers: "1", busType: "", returnTrip: false, returnDate: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [tripOptions, setTripOptions] = useState([]);
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.from) errs.from = "Select departure city";
    if (!form.to) errs.to = "Select destination";
    if (form.from && form.to && form.from === form.to) errs.to = "Destination must differ from departure";
    if (!form.date) errs.date = "Pick a date";
    if (!form.time) errs.time = "Pick a time";
    if (!form.busType) errs.busType = "Select bus type";
    if (form.returnTrip && !form.returnDate) errs.returnDate = "Pick a return date";
    return errs;
  };

  const normalizeRouteText = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[-–—>]+/g, " ")
      .trim();

  const handleSearch = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSearchError("");
    setTripOptions([]);

    const token = getAuthToken();
    if (!token) {
      navigate("/login");
      return;
    }

    setIsSearching(true);

    try {
      const response = await tripApi.getTrips();
      const trips = Array.isArray(response?.data) ? response.data : [];

      const fromNorm = normalizeRouteText(form.from);
      const toNorm = normalizeRouteText(form.to);

      const matchedTrips = trips.filter((item) => {
        const routeText = normalizeRouteText(item.route_name);
        const hasRouteMatch = routeText.includes(fromNorm) && routeText.includes(toNorm);
        const hasDateMatch = !form.date || String(item.trip_date || "").slice(0, 10) === form.date;
        const hasBusTypeMatch = !form.busType || String(item.vehicle_type || "").toLowerCase() === String(form.busType).toLowerCase();

        return hasRouteMatch && hasDateMatch && hasBusTypeMatch;
      });

      if (matchedTrips.length === 0) {
        setSearchError("No matching trips found. Try a different date, route, or bus type.");
        return;
      }

      setTripOptions(matchedTrips);
    } catch {
      setSearchError("Could not load available trips right now.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectTrip = (trip) => {
    navigate("/seat-booking", {
      state: {
        tripId: trip?.id || null,
        from: form.from,
        to: form.to,
        date: form.date,
        time: trip?.departure_time || form.time,
        passengers: form.passengers,
        busType: trip?.vehicle_type || form.busType,
      }
    });
  };

  const today = new Date().toISOString().split("T")[0];

  const inputStyle = (hasError) => ({
    width: "100%", background: "rgba(255,255,255,0.06)", color: "white",
    border: `1.5px solid ${hasError ? "#f87171" : "rgba(255,255,255,0.12)"}`,
    borderRadius: 12, padding: "14px 16px", fontSize: 15, outline: "none",
    boxSizing: "border-box", colorScheme: "dark",
  });

  const labelStyle = {
    display: "block", color: "rgba(255,255,255,0.5)", fontSize: 11,
    fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8,
  };

  return (
    <section id="booking" style={{ background: "#080808", padding: "96px 24px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>Step 1 of 1</p>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "clamp(36px,5vw,52px)", fontWeight: 900, color: "white", margin: "0 0 12px" }}>
            Book Your Journey
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 17, margin: 0 }}>Fast, simple, reliable — anywhere in Nepal.</p>
        </div>

        {submitted ? (
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "64px 32px", textAlign: "center" }}>
            <i className="fa-solid fa-circle-check" style={{ fontSize: 64, color: "#4ade80", marginBottom: 24, display: "block" }}></i>
            <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 32, fontWeight: 900, color: "white", margin: "0 0 12px" }}>Rides Found!</h3>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, margin: "0 0 8px" }}>{form.from} → {form.to}</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>{form.date} at {form.time} · {form.passengers} passenger(s) · {form.busType}</p>
            <button onClick={() => setSubmitted(false)} style={{
              marginTop: 32, background: "white", color: "black", border: "none",
              borderRadius: 50, padding: "12px 32px", fontWeight: 700, fontSize: 15, cursor: "pointer",
            }}>Search Again</button>
          </div>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 40 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Departure City</label>
                <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-map-pin" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "rgba(255,255,255,0.4)", pointerEvents: "none" }}></i>
                  <select value={form.from} onChange={(e) => update("from", e.target.value)}
                    style={{ ...inputStyle(errors.from), paddingLeft: 40, appearance: "none", cursor: "pointer" }}>
                    <option value="" style={{ background: "#111" }}>Select city…</option>
                    {CITIES.map((c) => <option key={c} value={c} style={{ background: "#111" }}>{c}</option>)}
                  </select>
                </div>
                {errors.from && <p style={{ color: "#f87171", fontSize: 11, marginTop: 6 }}>{errors.from}</p>}
              </div>
              <div>
                <label style={labelStyle}>Destination City</label>
                <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-flag-checkered" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "rgba(255,255,255,0.4)", pointerEvents: "none" }}></i>
                  <select value={form.to} onChange={(e) => update("to", e.target.value)}
                    style={{ ...inputStyle(errors.to), paddingLeft: 40, appearance: "none", cursor: "pointer" }}>
                    <option value="" style={{ background: "#111" }}>Select city…</option>
                    {CITIES.filter((c) => c !== form.from).map((c) => (
                      <option key={c} value={c} style={{ background: "#111" }}>{c}</option>
                    ))}
                  </select>
                </div>
                {errors.to && <p style={{ color: "#f87171", fontSize: 11, marginTop: 6 }}>{errors.to}</p>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Travel Date</label>
                <input type="date" min={today} value={form.date} onChange={(e) => update("date", e.target.value)} style={inputStyle(errors.date)} />
                {errors.date && <p style={{ color: "#f87171", fontSize: 11, marginTop: 6 }}>{errors.date}</p>}
              </div>
              <div>
                <label style={labelStyle}>Departure Time</label>
                <input type="time" value={form.time} onChange={(e) => update("time", e.target.value)} style={inputStyle(errors.time)} />
                {errors.time && <p style={{ color: "#f87171", fontSize: 11, marginTop: 6 }}>{errors.time}</p>}
              </div>
              <div>
                <label style={labelStyle}>Passengers</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 16px" }}>
                  <button type="button" onClick={() => update("passengers", String(Math.max(1, +form.passengers - 1)))}
                    style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.1)", color: "white", border: "none", cursor: "pointer", fontSize: 18, fontWeight: 700 }}>−</button>
                  <span style={{ flex: 1, textAlign: "center", color: "white", fontSize: 20, fontWeight: 700 }}>{form.passengers}</span>
                  <button type="button" onClick={() => update("passengers", String(Math.min(10, +form.passengers + 1)))}
                    style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.1)", color: "white", border: "none", cursor: "pointer", fontSize: 18, fontWeight: 700 }}>+</button>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Bus Type</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                {BUS_TYPES.map((type) => (
                  <button key={type} type="button" onClick={() => update("busType", type)} style={{
                    padding: "12px 8px", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer",
                    border: form.busType === type ? "1.5px solid white" : "1.5px solid rgba(255,255,255,0.12)",
                    background: form.busType === type ? "white" : "rgba(255,255,255,0.05)",
                    color: form.busType === type ? "black" : "rgba(255,255,255,0.7)",
                    transition: "all 0.2s",
                  }}>{type}</button>
                ))}
              </div>
              {errors.busType && <p style={{ color: "#f87171", fontSize: 11, marginTop: 6 }}>{errors.busType}</p>}
            </div>

            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => update("returnTrip", !form.returnTrip)}>
                <div style={{ width: 48, height: 24, borderRadius: 12, background: form.returnTrip ? "white" : "rgba(255,255,255,0.2)", position: "relative", transition: "background 0.3s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 4, left: form.returnTrip ? 28 : 4, width: 16, height: 16, borderRadius: "50%", background: form.returnTrip ? "black" : "white", transition: "left 0.3s" }} />
                </div>
                <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, fontWeight: 500, userSelect: "none" }}>Add return trip</span>
              </div>
              {form.returnTrip && (
                <div style={{ marginTop: 16, maxWidth: 280 }}>
                  <label style={labelStyle}>Return Date</label>
                  <input type="date" min={form.date || today} value={form.returnDate}
                    onChange={(e) => update("returnDate", e.target.value)} style={inputStyle(errors.returnDate)} />
                  {errors.returnDate && <p style={{ color: "#f87171", fontSize: 11, marginTop: 6 }}>{errors.returnDate}</p>}
                </div>
              )}
            </div>

            <button type="button" onClick={handleSearch} style={{
              width: "100%", background: "white", color: "black", border: "none",
              borderRadius: 16, padding: "20px", fontSize: 16, fontWeight: 900,
              cursor: "pointer", letterSpacing: "0.12em", textTransform: "uppercase",
            }}
              onMouseEnter={e => { e.target.style.background = "#f0f0f0"; e.target.style.transform = "scale(1.005)"; }}
              onMouseLeave={e => { e.target.style.background = "white"; e.target.style.transform = "scale(1)"; }}
            >{isSearching ? "Searching..." : "Search Available Rides →"}</button>

            {searchError && (
              <p style={{ textAlign: "center", color: "#f87171", fontSize: 12, marginTop: 12 }}>{searchError}</p>
            )}

            {tripOptions.length > 0 && (
              <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
                {tripOptions.slice(0, 6).map((trip) => (
                  <div key={trip.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 12, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <p style={{ margin: "0 0 4px", color: "white", fontSize: 13, fontWeight: 700 }}>{trip.route_name}</p>
                      <p style={{ margin: 0, color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
                        {String(trip.trip_date || "").slice(0, 10)} · {trip.departure_time || "N/A"} · {trip.vehicle_type || "Standard"} · {trip.total_seats || 0} seats
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectTrip(trip)}
                      style={{ background: "white", color: "black", border: "none", borderRadius: 50, padding: "10px 18px", fontSize: 12, fontWeight: 800, cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}
                    >
                      Select Trip
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 12, marginTop: 16, letterSpacing: "0.05em" }}>
              Free cancellation up to 24 hours before departure
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function Features() {
  const [hovered, setHovered] = useState(null);
  return (
    <section id="services" style={{ background: "white", padding: "96px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ color: "#aaa", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>Why us</p>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, color: "black", margin: 0 }}>
            Why Choose Hamro Sawari?
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title}
              onMouseEnter={() => setHovered(title)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: 32, borderRadius: 20,
                border: hovered === title ? "1.5px solid black" : "1.5px solid #f0f0f0",
                background: hovered === title ? "black" : "white",
                transition: "all 0.3s", cursor: "default",
              }}>
              <div style={{ marginBottom: 20 }}>
                <i className={`fa-solid ${icon}`} style={{
                  fontSize: 40, color: hovered === title ? "white" : "black", transition: "color 0.3s",
                }}></i>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: hovered === title ? "white" : "black", margin: "0 0 12px" }}>{title}</h3>
              <p style={{ color: hovered === title ? "#aaa" : "#666", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" style={{ background: "#f7f7f7", padding: "96px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <p style={{ color: "#aaa", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>Our Story</p>
        <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, color: "black", margin: "0 0 24px" }}>
          About Hamro Sawari
        </h2>
        <div style={{ width: 44, height: 3, background: "#000", margin: "0 auto 32px" }} />
        <p style={{ color: "#555", fontSize: 17, lineHeight: 1.8, marginBottom: 20 }}>
          Hamro Sawari was founded with a simple mission — to make bus travel across Nepal easy, affordable, and reliable for everyone. We connect thousands of passengers daily across 200+ routes spanning the length and breadth of Nepal.
        </p>
        <p style={{ color: "#555", fontSize: 17, lineHeight: 1.8, marginBottom: 48 }}>
          From the bustling streets of Kathmandu to the tranquil hills of Pokhara, our verified drivers and modern fleet ensure you arrive safely and on time, every time.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32 }}>
          {[["2019", "Founded"], ["50K+", "Monthly Rides"], ["200+", "Routes Covered"]].map(([val, label]) => (
            <div key={label} style={{ background: "white", borderRadius: 16, padding: "32px 20px", border: "1.5px solid #eee" }}>
              <div style={{ fontSize: 36, fontWeight: 900, fontFamily: "'Poppins', sans-serif", color: "black", marginBottom: 8 }}>{val}</div>
              <div style={{ fontSize: 13, color: "#999", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


const TEAM = [
  {
    name: "Aarav Sharma",
    role: "Founder & CEO",
    desc: "Visionary behind Hamro Sawari. 10+ years in Nepal's transport industry.",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    tag: "Leadership",
  },
  {
    name: "Priya Thapa",
    role: "Head of Operations",
    desc: "Manages 200+ routes and ensures every journey runs on time.",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    tag: "Operations",
  },
  {
    name: "Rohan Karki",
    role: "Lead Engineer",
    desc: "Builds the tech that powers seamless bookings across Nepal.",
    photo: "https://randomuser.me/api/portraits/men/65.jpg",
    tag: "Technology",
  },
  {
    name: "Sita Gurung",
    role: "Customer Experience",
    desc: "Dedicated to making every passenger feel heard and valued.",
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    tag: "Support",
  },
  {
    name: "Bikash Rai",
    role: "Route Partnerships",
    desc: "Expands our network by connecting with bus operators nationwide.",
    photo: "https://randomuser.me/api/portraits/men/41.jpg",
    tag: "Growth",
  },
];

const TAG_COLORS = {
  Leadership: { bg: "#fff0f0", color: "#e11d48" },
  Operations: { bg: "#f0fdf4", color: "#16a34a" },
  Technology: { bg: "#eff6ff", color: "#2563eb" },
  Support:    { bg: "#fefce8", color: "#ca8a04" },
  Growth:     { bg: "#faf5ff", color: "#9333ea" },
};

const FAQS = [
  { q: "How do I book a bus ticket?", a: "Select your departure city, destination, date and bus type on our home page, then click Search Available Rides." },
  { q: "Can I cancel my booking?", a: "Yes! Free cancellation is available up to 24 hours before your departure time." },
  { q: "Which cities do you cover?", a: "We cover 10+ major cities across Nepal including Kathmandu, Pokhara, Biratnagar, Birgunj and more." },
  { q: "How do I contact support?", a: "Fill the form below, email us at info@hamrosawari.com or call +977-123-456789." },
  { q: "Is my payment secure?", a: "Yes, all payments use encrypted PCI-compliant payment gateways. Your data is always safe." },
];

function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", rating: 0 });
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: "", email: "", subject: "", message: "", rating: 0 });
    }, 4000);
  };

  const labelSt = {
    display: "block", fontSize: 11, fontWeight: 700,
    marginBottom: 8, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase",
  };
  const fieldWr = {
    position: "relative", display: "flex", alignItems: "center",
    borderBottom: "1.5px solid #ddd", marginBottom: 16,
  };
  const inputSt = {
    flex: 1, border: "none", background: "transparent",
    padding: "7px 36px", fontSize: 14, outline: "none",
    color: "#222", fontFamily: "inherit",
  };
  const iconL = {
    position: "absolute", left: 2, color: "#bbb", fontSize: 13, pointerEvents: "none",
  };

  return (
    <>
      {/* Contact Info Cards */}
      <section id="contact" style={{ background: "#f7f7f7", padding: "96px 24px 64px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ color: "#aaa", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>Reach out</p>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, color: "black", margin: "0 0 8px" }}>
              Contact Us
            </h2>
            <div style={{ width: 44, height: 3, background: "#000", margin: "0 auto 16px" }} />
            <p style={{ color: "#888", fontSize: 15, margin: 0 }}>Questions, feedback or just want to say hello — we are here.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            {[
              { icon: "fa-envelope", label: "Email Us",      value: "info@hamrosawari.com", sub: "Reply within 24 hours" },
              { icon: "fa-phone",   label: "Call Us",        value: "+977-123-456789",      sub: "Mon–Sat, 8am–6pm" },
              { icon: "fa-map-pin", label: "Visit Us",       value: "Kathmandu, Nepal",     sub: "New Baneshwor, KTM" },
              { icon: "fa-clock",   label: "Working Hours",  value: "8:00 AM – 6:00 PM",    sub: "Monday to Saturday" },
            ].map(({ icon, label, value, sub }) => (
              <div key={label} style={{
                background: "white", borderRadius: 16, padding: "28px 24px",
                border: "1.5px solid #eee", textAlign: "center", transition: "all 0.25s",
              }}
                onMouseEnter={e => { e.currentTarget.style.border = "1.5px solid black"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.border = "1.5px solid #eee"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ width: 52, height: 52, background: "#000", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <i className={`fa-solid ${icon}`} style={{ color: "white", fontSize: 20 }}></i>
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999", margin: "0 0 6px" }}>{label}</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#111", margin: "0 0 4px" }}>{value}</p>
                <p style={{ fontSize: 12, color: "#bbb", margin: 0 }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback Form */}
      <section style={{ background: "white", padding: "80px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ color: "#aaa", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>Share your experience</p>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, color: "black", margin: "0 0 8px" }}>Leave Feedback</h2>
            <div style={{ width: 44, height: 3, background: "#000", margin: "0 auto" }} />
          </div>

          {submitted ? (
            <div style={{ textAlign: "center", padding: "60px 32px", background: "#f7f7f7", borderRadius: 20, border: "1.5px solid #eee" }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: 56, color: "#4ade80", display: "block", marginBottom: 20 }}></i>
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 26, fontWeight: 900, margin: "0 0 10px" }}>Thank You!</h3>
              <p style={{ color: "#777", fontSize: 15 }}>Your feedback has been received. We will get back to you soon.</p>
            </div>
          ) : (
            <div style={{ background: "#f9f9f9", borderRadius: 20, padding: 40, border: "1.5px solid #eee" }}>
              {/* Star Rating */}
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#666", marginBottom: 12 }}>Rate your experience</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                  {[1,2,3,4,5].map(star => (
                    <i key={star} className="fa-solid fa-star"
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => update("rating", star)}
                      style={{
                        fontSize: 32, cursor: "pointer",
                        color: star <= (hover || form.rating) ? "#facc15" : "#ddd",
                        transition: "color 0.15s, transform 0.15s",
                        transform: star <= (hover || form.rating) ? "scale(1.25)" : "scale(1)",
                      }}
                    ></i>
                  ))}
                </div>
                {form.rating > 0 && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10 }}>
                    <i className={`fa-solid ${["","fa-thumbs-down","fa-minus","fa-thumbs-up","fa-heart","fa-star"][form.rating]}`}
                      style={{ fontSize: 16, color: ["","#ef4444","#f59e0b","#22c55e","#3b82f6","#facc15"][form.rating] }}></i>
                    <span style={{ fontSize: 13, color: "#999", fontStyle: "italic" }}>
                      {["","Poor","Fair","Good","Very Good","Excellent"][form.rating]}
                    </span>
                  </div>
                )}
              </div>

              {/* Name & Email */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 4 }}>
                <div>
                  <label style={labelSt}>Full Name</label>
                  <div style={fieldWr}>
                    <i className="fa-solid fa-person" style={iconL}></i>
                    <input type="text" placeholder="Your name" value={form.name}
                      onChange={e => update("name", e.target.value)} style={inputSt} />
                  </div>
                </div>
                <div>
                  <label style={labelSt}>Email</label>
                  <div style={fieldWr}>
                    <i className="fa-solid fa-envelope" style={iconL}></i>
                    <input type="email" placeholder="your@email.com" value={form.email}
                      onChange={e => update("email", e.target.value)} style={inputSt} />
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div style={{ marginBottom: 4 }}>
                <label style={labelSt}>Subject</label>
                <div style={fieldWr}>
                  <i className="fa-solid fa-tag" style={iconL}></i>
                  <input type="text" placeholder="What is this about?" value={form.subject}
                    onChange={e => update("subject", e.target.value)} style={inputSt} />
                </div>
              </div>

              {/* Message */}
              <div style={{ marginBottom: 28 }}>
                <label style={labelSt}>Message</label>
                <textarea placeholder="Share your thoughts, suggestions or experience..."
                  value={form.message} onChange={e => update("message", e.target.value)}
                  rows={5} style={{
                    width: "100%", border: "none", borderBottom: "1.5px solid #ddd",
                    background: "transparent", padding: "10px 0", fontSize: 14,
                    outline: "none", fontFamily: "inherit", resize: "none", color: "#222",
                    boxSizing: "border-box",
                  }} />
              </div>

              <button onClick={handleSubmit} style={{
                width: "100%", background: "#000", color: "white", border: "none",
                borderRadius: 50, padding: "15px", fontSize: 14, fontWeight: 700,
                cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                transition: "background 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#222"}
                onMouseLeave={e => e.currentTarget.style.background = "#000"}
              >
                Send Feedback <i className="fa-solid fa-arrow-right-long"></i>
              </button>
            </div>
          )}
        </div>
      </section>

     

      {/* FAQ */}
      <section style={{ background: "white", padding: "80px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ color: "#aaa", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>Got questions?</p>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, color: "black", margin: "0 0 8px" }}>FAQ</h2>
            <div style={{ width: 44, height: 3, background: "#000", margin: "0 auto" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQS.map(({ q, a }, i) => (
              <div key={i} style={{
                border: "1.5px solid", borderColor: openFaq === i ? "#000" : "#eee",
                borderRadius: 14, overflow: "hidden", transition: "border-color 0.2s",
              }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                  width: "100%", background: openFaq === i ? "#000" : "none",
                  border: "none", padding: "18px 24px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  cursor: "pointer", textAlign: "left", transition: "background 0.2s",
                }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: openFaq === i ? "white" : "#111" }}>{q}</span>
                  <i className={`fa-solid ${openFaq === i ? "fa-chevron-up" : "fa-chevron-down"}`}
                    style={{ color: openFaq === i ? "white" : "#999", fontSize: 13, flexShrink: 0, marginLeft: 12 }}></i>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 24px 18px", background: "white" }}>
                    <p style={{ color: "#666", fontSize: 14, lineHeight: 1.7, margin: "14px 0 0" }}>{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Footer() {
  return (
    <footer style={{ background: "#000", color: "white", padding: "72px 24px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 56 }}>

          {/* Brand col */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <img src={logo} alt="Hamro Sawari" style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 8, background: "white", padding: 4 }} />
              <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: "0.15em", fontFamily: "'Poppins', sans-serif" }}>HAMRO SAWARI</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.8, maxWidth: 260, margin: "0 0 24px" }}>
              Nepal's most trusted bus booking platform. Connecting cities, one journey at a time.
            </p>
            {/* Social icons */}
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { icon: "fa-facebook-f", label: "Facebook" },
                { icon: "fa-instagram",  label: "Instagram" },
                { icon: "fa-twitter",    label: "Twitter" },
                { icon: "fa-youtube",    label: "YouTube" },
              ].map(({ icon, label }) => (
                <button key={label} title={label} style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "white", cursor: "pointer", fontSize: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "black"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "white"; }}
                >
                  <i className={`fa-brands ${icon}`}></i>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links col */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20, color: "rgba(255,255,255,0.4)", margin: "0 0 20px" }}>Quick Links</h4>
            {[["Home", "home"], ["Book Now", "booking"], ["Services", "services"], ["About Us", "about"], ["Contact", "contact"]].map(([label, id]) => (
              <button key={label}
                onClick={() => id === "home" ? window.scrollTo({ top: 0, behavior: "smooth" }) : scrollTo(id)}
                style={{ display: "block", color: "rgba(255,255,255,0.35)", fontSize: 14, marginBottom: 12, background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "white"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.35)"}
              >{label}</button>
            ))}
          </div>

          {/* Services col */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20, color: "rgba(255,255,255,0.4)", margin: "0 0 20px" }}>Services</h4>
            {["Standard Bus", "Express Bus", "Deluxe AC", "Tourist Coach", "Group Booking"].map(s => (
              <p key={s} style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, marginBottom: 12, margin: "0 0 12px" }}>{s}</p>
            ))}
          </div>

          {/* Contact col */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20, color: "rgba(255,255,255,0.4)", margin: "0 0 20px" }}>Contact</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <i className="fa-solid fa-envelope" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 2, flexShrink: 0 }}></i>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, lineHeight: 1.5 }}>info@hamrosawari.com</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <i className="fa-solid fa-phone" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 2, flexShrink: 0 }}></i>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>+977-123-456789</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <i className="fa-solid fa-map-pin" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 2, flexShrink: 0 }}></i>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, lineHeight: 1.5 }}>New Baneshwor,<br/>Kathmandu, Nepal</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <i className="fa-solid fa-clock" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 2, flexShrink: 0 }}></i>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, lineHeight: 1.5 }}>Mon–Sat<br/>8:00 AM – 6:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, margin: 0 }}>© 2025 Hamro Sawari. All rights reserved.</p>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy Policy", "Terms of Service", "Support"].map((l) => (
              <a key={l} href="#" style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "white"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.25)"}
              >{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "#000", fontFamily: "'Poppins', sans-serif" }}>
      <Navbar scrolled={scrolled} />
      <Hero />
      <BookingSection />
      <Features />
      <About />
      <ContactSection />
      <Footer />
    </div>
  );
}