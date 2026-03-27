import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import UserPanel from "./pages/User";
import DriverDashboard from "./pages/Driverdashboard";
import Payment from "./pages/Payment";
import SeatBooking from "./pages/SeatBooking";
import Landing from "./pages/Landing";
import { getStoredUser } from "./services/api";

function ProtectedRoute({ children, allowedRoles }) {
  const user = getStoredUser();
  const role = String(user?.role || "").toLowerCase().trim();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function DashboardRedirect() {
  const user = getStoredUser();
  const role = String(user?.role || "").toLowerCase().trim();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (role === "driver") {
    return <Navigate to="/driver" replace />;
  }

  return <Navigate to="/user" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPanel /></ProtectedRoute>} />
        <Route path="/user" element={<ProtectedRoute allowedRoles={["passenger"]}><UserPanel /></ProtectedRoute>} />
        <Route path="/driver" element={<ProtectedRoute allowedRoles={["driver"]}><DriverDashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/payment" element={<ProtectedRoute allowedRoles={["passenger"]}><Payment /></ProtectedRoute>} />
        <Route path="/seat-booking" element={<ProtectedRoute allowedRoles={["passenger"]}><SeatBooking /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
