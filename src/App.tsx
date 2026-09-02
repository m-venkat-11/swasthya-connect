import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { NavigationDock } from './components/NavigationDock';
import { Home } from './pages/Home';
import { LocationStep } from './pages/LocationStep';
import { RecommendedFacilities } from './pages/RecommendedFacilities';
import { FacilityDetail } from './pages/FacilityDetail';
import { EmergencyMode } from './pages/EmergencyMode';
import { AdminPortal } from './pages/AdminPortal';
import { ServiceSearch } from './pages/ServiceSearch';
import { MedicalCardPage } from './pages/MedicalCardPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-100 text-slate-900 font-sans antialiased">
      <Header />
      <NavigationDock />
      
      {/* Full Tab Content Container — generous padding and full natural tab width */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:pl-28 lg:pr-6 pt-6 pb-24 lg:pb-12 transition-all">
        {children}
      </main>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:pl-28 lg:pr-6">
        <Footer />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/location" element={<LocationStep />} />
            <Route path="/services" element={<ServiceSearch />} />
            <Route path="/results" element={<RecommendedFacilities />} />
            <Route path="/facility/:id" element={<FacilityDetail />} />
            <Route path="/emergency" element={<EmergencyMode />} />
            <Route path="/admin" element={<AdminPortal />} />
            <Route path="/profile" element={<MedicalCardPage />} />
            <Route path="/medical-card" element={<Navigate to="/profile" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
