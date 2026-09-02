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

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-100 text-slate-900 font-sans antialiased">
      <Header />
      <NavigationDock />
      
      {/* Main Content Area with Desktop Side Clearance & Mobile Bottom Clearance */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-6 pb-24 lg:pb-12 lg:pl-72 transition-all">
        {children}
      </main>

      <div className="lg:pl-72">
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
