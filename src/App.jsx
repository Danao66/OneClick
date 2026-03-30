import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context';
import { ClientLayout, AdminLayout } from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';

// Client pages
import ClientDashboard from './pages/client/Dashboard';
import PitchDeck from './pages/client/PitchDeck';
import Documents from './pages/client/Documents';
import SuiviTravaux from './pages/client/SuiviTravaux';
import Onboarding from './pages/client/Onboarding';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminClients from './pages/admin/Clients';
import AdminBiens from './pages/admin/Biens';
import AdminAgences from './pages/admin/Agences';
import MoteurImmo from './pages/admin/MoteurImmo';
import SuiviFinancier from './pages/admin/SuiviFinancier';
import Automatisations from './pages/admin/Automatisations';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Client Portal — requires auth */}
          <Route path="/client" element={
            <ProtectedRoute requiredRole="client">
              <AppProvider>
                <ClientLayout />
              </AppProvider>
            </ProtectedRoute>
          }>
            <Route index element={<ClientDashboard />} />
            <Route path="pitch-deck" element={<PitchDeck />} />
            <Route path="documents" element={<Documents />} />
            <Route path="travaux" element={<SuiviTravaux />} />
            <Route path="onboarding" element={<Onboarding />} />
          </Route>

          {/* Admin Back-Office — requires admin role */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AppProvider>
                <AdminLayout />
              </AppProvider>
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="biens" element={<AdminBiens />} />
            <Route path="agences" element={<AdminAgences />} />
            <Route path="moteur" element={<MoteurImmo />} />
            <Route path="financier" element={<SuiviFinancier />} />
            <Route path="automatisations" element={<Automatisations />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
