import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context';
import { ClientLayout, AdminLayout } from './components/Layout';

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
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Client Portal */}
          <Route path="/client" element={<ClientLayout />}>
            <Route index element={<ClientDashboard />} />
            <Route path="pitch-deck" element={<PitchDeck />} />
            <Route path="documents" element={<Documents />} />
            <Route path="travaux" element={<SuiviTravaux />} />
            <Route path="onboarding" element={<Onboarding />} />
          </Route>

          {/* Admin Back-Office */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="biens" element={<AdminBiens />} />
            <Route path="agences" element={<AdminAgences />} />
            <Route path="moteur" element={<MoteurImmo />} />
            <Route path="financier" element={<SuiviFinancier />} />
            <Route path="automatisations" element={<Automatisations />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/client" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
