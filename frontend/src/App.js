import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import AsesorDashboard from "./pages/asesor/AsesorDashboard";
import CompanyList from "./pages/asesor/CompanyList";
import CompanyForm from "./pages/asesor/CompanyForm";
import CompanyDetail from "./pages/asesor/CompanyDetail";
import ClienteDashboard from "./pages/cliente/ClienteDashboard";

// Components
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
          </Route>

          {/* Asesor Routes */}
          <Route
            path="/asesor"
            element={
              <ProtectedRoute allowedRoles={["asesor"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AsesorDashboard />} />
            <Route path="empresas" element={<CompanyList />} />
            <Route path="empresas/nueva" element={<CompanyForm />} />
            <Route path="empresas/:id" element={<CompanyDetail />} />
            <Route path="empresas/:id/editar" element={<CompanyForm />} />
          </Route>

          {/* Cliente Routes */}
          <Route
            path="/cliente"
            element={
              <ProtectedRoute allowedRoles={["cliente"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ClienteDashboard />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
