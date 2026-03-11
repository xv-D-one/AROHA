import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";

import AdminDashboard from "./pages/admin/AdminDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import PatientDashboard from "./pages/patient/PatientDashboard";

import DoctorsPage from "./pages/admin/DoctorsPage";
import PatientsPage from "./pages/admin/PatientsPage";
import CreatePatient from "./pages/admin/CreatePatient";


import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import CreateDoctor from "./pages/admin/CreateDoctor";
import AdminMedicalRecords from "./pages/admin/Adminmedicalrecords";


function App() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<Login />} />

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
        <Route path="patients/create" element={<CreatePatient />} />
        <Route path="patients/create" element={<AdminMedicalRecords />} />
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