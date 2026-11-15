import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { DocumentsListPage } from './pages/DocumentsListPage';
import { DocumentResultsPage } from './pages/DocumentResultsPage';
import { RemindersPage } from './pages/RemindersPage';
import { ChatPage } from './pages/ChatPage';
import { CaregiversPage } from './pages/CaregiversPage';
import { PrescriptionTranslationPage } from './pages/PrescriptionTranslationPage';
import { PublicTranslationResultsPage } from './pages/PublicTranslationResultsPage';
import { ProfilePage } from './pages/ProfilePage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090909]">
        <div className="relative">
          <div className="w-10 h-10 border-4 border-[#EF2929] border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 bg-[#EF2929]/20 blur-md rounded-full -z-10" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />;
  }

  return <>{children}</>;
};

const MainContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className={`min-h-screen flex flex-col bg-[#090909] text-white font-sans ${isAuthenticated ? 'lg:pl-64' : ''}`}>
      <Navbar />
      <main className={`flex-1 ${isAuthenticated ? 'pb-24 lg:pb-8' : ''}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/prescription-translation" element={<PrescriptionTranslationPage />} />
          <Route path="/prescription-translation/results/:accessToken" element={<PublicTranslationResultsPage />} />

          {/* Protected Patient & Caregiver Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <DocumentsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/:id"
            element={
              <ProtectedRoute>
                <DocumentResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reminders"
            element={
              <ProtectedRoute>
                <RemindersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assistant"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/caregivers"
            element={
              <ProtectedRoute>
                <CaregiversPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAuthenticated && (
        <footer className="border-t border-[#1F1F1F] py-8 text-center text-xs text-neutral-500 bg-[#0B0B0B]">
          <p className="font-medium tracking-wide">
            MedEase © 2026 • AI-Powered Medical Document Understanding & Patient Care
          </p>
          <p className="text-[11px] text-neutral-600 mt-1">
            മെഡിക്കൽ രേഖകൾ ലളിതമായ മലയാളത്തിൽ • Non-diagnostic clinical terminology assistant
          </p>
        </footer>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
