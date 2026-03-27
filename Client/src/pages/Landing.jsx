import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/styles/OIP.webp";

// Animated counter hook
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// Intersection observer hook
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

const STEPS = [
  {
    num: "01",
    icon: "fa-magnifying-glass",
    title: "Search Your Route",
    desc: "Enter your departure city, destination, travel date and preferred bus type. Choose from 200+ routes across Nepal.",
    color: "#000",
  },
  {
    num: "02",
    icon: "fa-couch",
    title: "Pick Your Seat",
    desc: "View real-time seat availability on an interactive bus map. Select your preferred seat — window, aisle, front or back.",
    color: "#000",
  },
  {
    num: "03",
    icon: "fa-qrcode",
    title: "Pay Securely",
    desc: "Pay instantly with eSewa, Khalti, Bank QR or cash on board. Your booking is confirmed in seconds.",
    color: "#000",
  },
  {
    num: "04",
    icon: "fa-bus",
    title: "Board & Ride",
    desc: "Show your booking reference to the driver and enjoy your journey. Track the bus live via GPS in real time.",
    color: "#000",
  },
];

const FEATURES = [
  { icon: "fa-location-dot",  title: "Live GPS Tracking",    desc: "Track your bus in real time. Know exactly where it is and when it arrives." },
  { icon: "fa-ticket",        title: "Instant Booking",      desc: "Book your seat in under 30 seconds — no queues, no waiting, no hassle." },
  { icon: "fa-qrcode",        title: "QR Payments",          desc: "Pay with eSewa, Khalti or Bank QR. Fast, secure and paperless." },
  { icon: "fa-bell",          title: "Smart Alerts",         desc: "Get notified about delays, route changes and departure reminders." },
  { icon: "fa-rotate-left",   title: "Easy Cancellation",    desc: "Cancel up to 24 hours before departure. Hassle-free refund process." },
  { icon: "fa-star",          title: "Rated Drivers",        desc: "Every driver is verified, background-checked and rated by passengers." },
];

export default function Landing() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [statsRef, statsInView] = useInView(0.3);
  const [stepsRef, stepsInView] = useInView(0.1);
  const [featRef, featInView] = useInView(0.1);
  const [hoveredStep, setHoveredStep] = useState(null);
  const [hoveredFeat, setHoveredFeat] = useState(null);

  const rides  = useCounter(50000, 2200, statsInView);
  const routes = useCounter(200,   1800, statsInView);
  const users  = useCounter(4300,  2000, statsInView);
  const rating = useCounter(49,    2000, statsInView);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: "#fff", overflowX: "hidden", width: "100%" }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-14px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.8; transform: scale(1.08); }
        }
        @keyframes slideRight {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .hero-text { animation: fadeUp 1s ease both; }
        .hero-text-2 { animation: fadeUp 1s ease 0.2s both; }
        .hero-text-3 { animation: fadeUp 1s ease 0.4s both; }
        .hero-btns  { animation: fadeUp 1s ease 0.6s both; }
        .hero-stats { animation: fadeUp 1s ease 0.8s both; }
        .bus-float  { animation: float 4s ease-in-out infinite; }
        .orb-pulse  { animation: pulse 3s ease-in-out infinite; }
        .step-line  { animation: slideRight 1.2s ease 0.3s both; }
        .nav-link { font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.7); background: none; border: none; cursor: pointer; transition: color 0.2s; padding: 0; }
        .nav-link:hover { color: white; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrollY > 60 ? "rgba(0,0,0,0.96)" : "transparent",
        backdropFilter: scrollY > 60 ? "blur(16px)" : "none",
        padding: scrollY > 60 ? "12px 0" : "22px 0",
        transition: "all 0.4s ease",
        borderBottom: scrollY > 60 ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => navigate("/")}>
            <img src={logo} alt="logo" style={{ width: 38, height: 38, objectFit: "contain", background: "white", borderRadius: 9, padding: 4 }} />
            <span style={{ color: "white", fontWeight: 900, fontSize: 19, letterSpacing: "0.12em", fontFamily: "'Poppins', sans-serif" }}>HAMRO SAWARI</span>
          </div>
          <div style={{ display: "flex", gap: 36 }}>
            {[["Features", "#features"], ["How It Works", "#steps"], ["About", "#about"]].map(([label, href]) => (
              <a key={label} href={href} className="nav-link" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "white"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.7)"}
              >{label}</a>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => navigate("/login")} style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 50, padding: "9px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins', sans-serif", letterSpacing: "0.06em", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            >Login</button>
            <button onClick={() => navigate("/login", { state: { signup: true } })} style={{ background: "white", color: "black", border: "none", borderRadius: 50, padding: "9px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins', sans-serif", letterSpacing: "0.06em", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#e8e8e8"}
              onMouseLeave={e => e.currentTarget.style.background = "white"}
            >Get Started</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", background: "#000", position: "relative", display: "flex", alignItems: "center", overflow: "hidden" }}>

        {/* Animated grid */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.07, backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />

        {/* Glow orbs */}
        <div className="orb-pulse" style={{ position: "absolute", top: "15%", left: "5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div className="orb-pulse" style={{ position: "absolute", bottom: "10%", right: "5%", width: 400, height: 400, background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", animationDelay: "1.5s" }} />

        {/* Diagonal accent line */}
        <div style={{ position: "absolute", top: 0, right: "35%", width: 1, height: "100%", background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent)", transform: "skewX(-15deg)" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "120px 32px 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", position: "relative", zIndex: 1 }}>

          {/* Left */}
          <div>
            <div className="hero-text" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 50, padding: "6px 18px", marginBottom: 28 }}>
              <span style={{ width: 8, height: 8, background: "#4ade80", borderRadius: "50%", display: "inline-block" }} />
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Poppins', sans-serif" }}>Nepal's #1 Bus Booking Platform</span>
            </div>

            <h1 className="hero-text-2" style={{ fontSize: "clamp(52px, 6vw, 84px)", fontWeight: 900, color: "white", lineHeight: 1.05, margin: "0 0 8px", letterSpacing: "-2px" }}>
              Travel Nepal
            </h1>
            <h1 style={{ fontSize: "clamp(52px, 6vw, 84px)", fontWeight: 900, lineHeight: 1.05, margin: "0 0 24px", letterSpacing: "-2px", background: "linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.35) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "fadeUp 1s ease 0.3s both" }}>
              Smarter.
            </h1>

            <p className="hero-text-3" style={{ color: "rgba(255,255,255,0.5)", fontSize: 18, lineHeight: 1.75, margin: "0 0 40px", maxWidth: 460, fontFamily: "'Poppins', sans-serif", fontWeight: 300 }}>
              Book bus seats, track live GPS, pay with QR — all in one place. Connecting cities across Nepal, one journey at a time.
            </p>

            <div className="hero-btns" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <button onClick={() => navigate("/home")} style={{ background: "white", color: "black", border: "none", borderRadius: 50, padding: "16px 36px", fontSize: 15, fontWeight: 800, cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'Poppins', sans-serif", display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f0f0f0"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(255,255,255,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                Book Now <i className="fa-solid fa-arrow-right-long"></i>
              </button>
              <button onClick={() => navigate("/home")} style={{ background: "transparent", color: "white", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: 50, padding: "16px 36px", fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: "0.04em", fontFamily: "'Poppins', sans-serif", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
              >
                Explore Routes
              </button>
            </div>

            {/* Trust badges */}
            <div className="hero-stats" style={{ display: "flex", gap: 28, marginTop: 48, flexWrap: "wrap" }}>
              {[["fa-shield-halved","Secure Payments"],["fa-clock","24/7 Support"],["fa-location-dot","Live GPS"]].map(([icon, label]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <i className={`fa-solid ${icon}`} style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}></i>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: "0.05em" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Animated bus card */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>

            {/* Outer glow ring */}
            <div style={{ position: "absolute", width: 380, height: 380, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)", animation: "spin 20s linear infinite" }} />
            <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)", animation: "spin 15s linear infinite reverse" }} />

            {/* Main card */}
            <div className="bus-float" style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 28, padding: "36px 32px", width: 320, position: "relative", zIndex: 1 }}>

              {/* Bus route display */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "'Poppins', sans-serif", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>From</p>
                    <p style={{ margin: 0, color: "white", fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px" }}>KTM</p>
                  </div>
                  <div style={{ flex: 1, margin: "0 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", width: "100%", gap: 4 }}>
                      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.15)" }} />
                      <i className="fa-solid fa-bus" style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}></i>
                      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.15)" }} />
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>7 hrs</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "'Poppins', sans-serif", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>To</p>
                    <p style={{ margin: 0, color: "white", fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px" }}>PKR</p>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "'Poppins', sans-serif" }}>Kathmandu</span>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "'Poppins', sans-serif" }}>Pokhara</span>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "0 0 20px" }} />

              {/* Seat mini map */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ margin: "0 0 10px", color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "'Poppins', sans-serif", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Seat Availability</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 5 }}>
                  {Array.from({ length: 32 }, (_, i) => (
                    <div key={i} style={{ height: 14, borderRadius: 3, background: [2,5,8,11,14,19,22,25].includes(i) ? "rgba(255,255,255,0.08)" : i === 7 ? "#4ade80" : "rgba(255,255,255,0.2)" }} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  {[["rgba(255,255,255,0.2)","Available"],["#4ade80","Selected"],["rgba(255,255,255,0.08)","Booked"]].map(([color, label]) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 8, height: 8, background: color, borderRadius: 2 }} />
                      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: "'Poppins', sans-serif" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price + book */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 16px" }}>
                <div>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>Price/seat</p>
                  <p style={{ margin: 0, color: "white", fontSize: 20, fontWeight: 900, fontFamily: "'Poppins', sans-serif" }}>NPR 1,200</p>
                </div>
                <div style={{ background: "white", borderRadius: 10, padding: "10px 16px", cursor: "pointer" }}>
                  <span style={{ color: "black", fontSize: 12, fontWeight: 800, fontFamily: "'Poppins', sans-serif", letterSpacing: "0.06em" }}>BOOK →</span>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div style={{ position: "absolute", top: "8%", right: "-8%", background: "white", borderRadius: 12, padding: "10px 14px", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: 8, animation: "fadeUp 1s ease 1s both" }}>
              <i className="fa-solid fa-location-dot" style={{ color: "#e11d48", fontSize: 14 }}></i>
              <div>
                <p style={{ margin: 0, fontSize: 10, color: "#999", fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>Live Tracking</p>
                <p style={{ margin: 0, fontSize: 12, color: "#111", fontWeight: 800, fontFamily: "'Poppins', sans-serif" }}>En Route</p>
              </div>
            </div>

            <div style={{ position: "absolute", bottom: "10%", left: "-10%", background: "white", borderRadius: 12, padding: "10px 14px", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: 8, animation: "fadeUp 1s ease 1.2s both" }}>
              <i className="fa-solid fa-circle-check" style={{ color: "#16a34a", fontSize: 16 }}></i>
              <div>
                <p style={{ margin: 0, fontSize: 10, color: "#999", fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>Booking</p>
                <p style={{ margin: 0, fontSize: 12, color: "#111", fontWeight: 800, fontFamily: "'Poppins', sans-serif" }}>Confirmed!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", fontFamily: "'Poppins', sans-serif" }}>Scroll</span>
          <div style={{ width: 1, height: 52, background: "linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)" }} />
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} style={{ background: "#000", padding: "0 32px 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 64, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }}>
            {[
              { value: rides,  suffix: "+", label: "Rides / Month",  prefix: "" },
              { value: routes, suffix: "+", label: "Routes Covered", prefix: "" },
              { value: users,  suffix: "+", label: "Happy Users",    prefix: "" },
              { value: rating, suffix: "★", label: "Average Rating", prefix: "4." },
            ].map(({ value, suffix, label, prefix }, i) => (
              <div key={label} style={{ textAlign: "center", padding: "0 20px", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                <p style={{ margin: "0 0 8px", fontSize: "clamp(36px,4vw,58px)", fontWeight: 900, color: "white", letterSpacing: "-2px" }}>
                  {prefix}{value.toLocaleString()}{suffix}
                </p>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "'Poppins', sans-serif", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="steps" ref={stepsRef} style={{ background: "white", padding: "100px 32px", scrollMarginTop: "70px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <p style={{ color: "#bbb", fontSize: 11, fontFamily: "'Poppins', sans-serif", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 14px" }}>Simple Process</p>
            <h2 style={{ fontSize: "clamp(36px,5vw,60px)", fontWeight: 900, color: "#000", margin: "0 0 16px", letterSpacing: "-1.5px", lineHeight: 1.1 }}>
              How It Works
            </h2>
            <p style={{ color: "#888", fontSize: 17, fontFamily: "'Poppins', sans-serif", fontWeight: 300, maxWidth: 480, margin: "0 auto" }}>
              From search to seat — book your ride in under 60 seconds.
            </p>
          </div>

          {/* Steps */}
          <div style={{ position: "relative" }}>
            {/* Connecting line */}
            <div style={{ position: "absolute", top: 52, left: "12.5%", right: "12.5%", height: 1, background: "#f0f0f0", zIndex: 0 }} />
            {stepsInView && <div className="step-line" style={{ position: "absolute", top: 52, left: "12.5%", height: 1, background: "#000", zIndex: 1 }} />}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 32, position: "relative", zIndex: 2 }}>
              {STEPS.map(({ num, icon, title, desc }, i) => (
                <div key={num}
                  onMouseEnter={() => setHoveredStep(i)}
                  onMouseLeave={() => setHoveredStep(null)}
                  style={{
                    textAlign: "center", cursor: "default",
                    opacity: stepsInView ? 1 : 0,
                    transform: stepsInView ? "translateY(0)" : "translateY(30px)",
                    transition: `all 0.6s ease ${i * 0.15}s`,
                  }}
                >
                  {/* Circle */}
                  <div style={{
                    width: 72, height: 72, borderRadius: "50%",
                    background: hoveredStep === i ? "#000" : "white",
                    border: hoveredStep === i ? "3px solid #000" : "3px solid #eee",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 24px", transition: "all 0.3s",
                    boxShadow: hoveredStep === i ? "0 12px 40px rgba(0,0,0,0.15)" : "none",
                  }}>
                    <i className={`fa-solid ${icon}`} style={{ fontSize: 24, color: hoveredStep === i ? "white" : "#333", transition: "color 0.3s" }}></i>
                  </div>

                  <span style={{ display: "inline-block", background: hoveredStep === i ? "#000" : "#f5f5f5", color: hoveredStep === i ? "white" : "#bbb", fontSize: 10, fontWeight: 800, fontFamily: "'Poppins', sans-serif", letterSpacing: "0.1em", padding: "3px 10px", borderRadius: 50, marginBottom: 12, transition: "all 0.3s" }}>{num}</span>

                  <h3 style={{ fontSize: 18, fontWeight: 900, color: "#000", margin: "0 0 10px", letterSpacing: "-0.3px" }}>{title}</h3>
                  <p style={{ color: "#888", fontSize: 14, lineHeight: 1.7, margin: 0, fontFamily: "'Poppins', sans-serif", fontWeight: 300 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center", marginTop: 72 }}>
            <button onClick={() => navigate("/home")} style={{ background: "#000", color: "white", border: "none", borderRadius: 50, padding: "18px 48px", fontSize: 15, fontWeight: 800, cursor: "pointer", letterSpacing: "0.06em", fontFamily: "'Poppins', sans-serif", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 12, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#222"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#000"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              Start Booking Now <i className="fa-solid fa-arrow-right-long"></i>
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" ref={featRef} style={{ background: "#f7f7f7", padding: "100px 32px", scrollMarginTop: "70px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "#bbb", fontSize: 11, fontFamily: "'Poppins', sans-serif", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 14px" }}>Everything You Need</p>
            <h2 style={{ fontSize: "clamp(36px,5vw,60px)", fontWeight: 900, color: "#000", margin: 0, letterSpacing: "-1.5px", lineHeight: 1.1 }}>
              Built for Nepal
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {FEATURES.map(({ icon, title, desc }, i) => (
              <div key={title}
                onMouseEnter={() => setHoveredFeat(i)}
                onMouseLeave={() => setHoveredFeat(null)}
                style={{
                  background: hoveredFeat === i ? "#000" : "white",
                  borderRadius: 20, padding: "32px 28px",
                  border: hoveredFeat === i ? "1.5px solid #000" : "1.5px solid #eee",
                  transition: "all 0.3s", cursor: "default",
                  transform: hoveredFeat === i ? "translateY(-6px)" : "translateY(0)",
                  boxShadow: hoveredFeat === i ? "0 20px 60px rgba(0,0,0,0.12)" : "none",
                  opacity: featInView ? 1 : 0,
                  transitionDelay: `${i * 0.08}s`,
                }}
              >
                <div style={{ width: 50, height: 50, background: hoveredFeat === i ? "rgba(255,255,255,0.1)" : "#f5f5f5", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, transition: "all 0.3s" }}>
                  <i className={`fa-solid ${icon}`} style={{ fontSize: 22, color: hoveredFeat === i ? "white" : "#333", transition: "color 0.3s" }}></i>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: hoveredFeat === i ? "white" : "#000", margin: "0 0 10px", transition: "color 0.3s" }}>{title}</h3>
                <p style={{ color: hoveredFeat === i ? "rgba(255,255,255,0.55)" : "#888", fontSize: 14, lineHeight: 1.7, margin: 0, fontFamily: "'Poppins', sans-serif", fontWeight: 300, transition: "color 0.3s" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT / CTA BANNER */}
      <section id="about" style={{ background: "#000", padding: "100px 32px", position: "relative", overflow: "hidden", scrollMarginTop: "70px" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <img src={logo} alt="logo" style={{ width: 72, height: 72, objectFit: "contain", background: "white", borderRadius: 18, padding: 8, marginBottom: 28 }} />
          <h2 style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, color: "white", margin: "0 0 20px", letterSpacing: "-2px", lineHeight: 1.1 }}>
            Ready to Ride?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 18, fontFamily: "'Poppins', sans-serif", fontWeight: 300, lineHeight: 1.7, margin: "0 0 48px" }}>
            Join thousands of Nepalis who book smarter with Hamro Sawari. Your journey starts with a single click.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/login")} style={{ background: "white", color: "black", border: "none", borderRadius: 50, padding: "16px 40px", fontSize: 15, fontWeight: 800, cursor: "pointer", letterSpacing: "0.05em", fontFamily: "'Poppins', sans-serif", display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f0f0f0"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Create Free Account <i className="fa-solid fa-arrow-right-long"></i>
            </button>
            <button onClick={() => navigate("/login")} style={{ background: "transparent", color: "white", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: 50, padding: "16px 40px", fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em", fontFamily: "'Poppins', sans-serif", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.background = "transparent"; }}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#000", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "28px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={logo} alt="logo" style={{ width: 28, height: 28, objectFit: "contain", background: "white", borderRadius: 6, padding: 3 }} />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: "0.1em" }}>HAMRO SAWARI</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, fontFamily: "'Poppins', sans-serif", margin: 0 }}>© 2025 Hamro Sawari. All rights reserved.</p>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy","Terms","Support"].map(l => (
              <a key={l} href="#" style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, fontFamily: "'Poppins', sans-serif", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "white"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.25)"}
              >{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}