import { Routes, Route } from "react-router-dom";

import LandingPage from "./features/landing/LandingPage";
import Login from "./pages/Login";

import AdminDashboard from "./pages/admin/AdminDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import PatientDashboard from "./pages/patient/PatientDashboard";

import DoctorsPage from "./pages/admin/DoctorsPage";
import PatientsPage from "./pages/admin/PatientsPage";

import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import CreateDoctor from "./pages/admin/CreateDoctor";

function App() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

      {/* Admin Routes with Layout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="doctors/create" element={<CreateDoctor />} />
        <Route path="patients" element={<PatientsPage />} />
      </Route>

      {/* Doctor Routes */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRoles={["DOCTOR"]}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Patient Routes */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute allowedRoles={["PATIENT"]}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;