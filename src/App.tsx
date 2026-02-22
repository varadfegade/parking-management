import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import AppLoader from './components/AppLoader/AppLoader';
import Layout from './components/Layout/Layout';

import Dashboard from './components/Dashboard/Dashboard';

import Booking from './components/Booking/Booking';

import Retrieval from './components/Retrieval/Retrieval';
import History from './components/History/History';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login/Login';

import FacilitySetup from './components/Facility/FacilitySetup';
import FacilityJoin from './components/Facility/FacilityJoin';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { role } = useAuth();
  if (!role) return <Login />;
  return <>{children}</>;
};

function App() {
  const [loadingComplete, setLoadingComplete] = useState(false);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          {!loadingComplete && <AppLoader onComplete={() => setLoadingComplete(true)} />}

          {loadingComplete && (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/facility/setup" element={<ProtectedRoute><FacilitySetup /></ProtectedRoute>} />
              <Route path="/facility/join" element={<ProtectedRoute><FacilityJoin /></ProtectedRoute>} />

              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="booking" element={<Booking />} />
                <Route path="retrieval" element={<Retrieval />} />
                <Route path="history" element={<History />} />
              </Route>
            </Routes>
          )}
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
