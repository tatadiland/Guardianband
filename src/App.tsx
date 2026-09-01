import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import GuardianApp from "./pages/GuardianApp";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected routes — require JWT token */}
        <Route path="/dashboard" element={<PrivateRoute><GuardianApp kind="dashboard" /></PrivateRoute>} />
        <Route path="/iot" element={<PrivateRoute><GuardianApp kind="iot" /></PrivateRoute>} />
        <Route path="/health" element={<PrivateRoute><GuardianApp kind="health" /></PrivateRoute>} />
        <Route path="/location" element={<PrivateRoute><GuardianApp kind="location" /></PrivateRoute>} />
        <Route path="/geofencing" element={<PrivateRoute><GuardianApp kind="geofencing" /></PrivateRoute>} />
        <Route path="/geofence" element={<PrivateRoute><GuardianApp kind="geofencing" /></PrivateRoute>} />
        <Route path="/device" element={<PrivateRoute><GuardianApp kind="device" /></PrivateRoute>} />
        <Route path="/alerts" element={<PrivateRoute><GuardianApp kind="alerts" /></PrivateRoute>} />
        <Route path="/routine" element={<PrivateRoute><GuardianApp kind="routine" /></PrivateRoute>} />
        <Route path="/assistant" element={<PrivateRoute><GuardianApp kind="assistant" /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><GuardianApp kind="profile" /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><GuardianApp kind="settings" /></PrivateRoute>} />
        <Route path="/investigation" element={<PrivateRoute><GuardianApp kind="investigation" /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;