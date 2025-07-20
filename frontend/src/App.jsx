// ECNN - Kopya/frontend/src/App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import { ThemeProvider } from './contexts/ThemeContext';
import AdminLayout from './components/layout/AdminLayout';
import Footer from './components/layout/Footer';
import './index.css';
import './dark-header-nav.css'; // Tailwind ve genel stiller

// Sayfaları lazy loading ile yükleyelim
const HomePage = lazy(() => import('./pages/HomePage'));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage')); // Yeni
const AboutPage = lazy(() => import('./pages/AboutPage')); // Yeni
const HighlightsPage = lazy(() => import('./pages/HighlightsPage')); // Yeni

// Admin Sayfaları
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminArticlesListPage = lazy(() => import('./pages/admin/AdminArticlesListPage'));
const CreateArticlePage = lazy(() => import('./pages/admin/CreateArticlePage'));
const EditArticlePage = lazy(() => import('./pages/admin/EditArticlePage'));
const AdminUsersListPage = lazy(() => import('./pages/admin/AdminUsersListPage'));

// Admin yetkisi kontrolü için yardımcı bileşen
const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p>Yetki kontrol ediliyor...</p></div>;
  }
  return user && user.isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

// Giriş yapmış kullanıcıların login sayfasına gitmesini engellemek için
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p>Yükleniyor...</p></div>;
  }
  return user ? <Navigate to={user.isAdmin ? "/admin/dashboard" : "/"} replace /> : children;
};

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-800 dark:text-slate-200 transition-colors">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 md:pt-28 transition-colors"> {/* Header yüksekliğine göre padding-top ayarlandı */}
        <Suspense fallback={<div className="text-center py-20 text-lg font-semibold">Sayfa Yükleniyor...</div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/articles/:slug" element={<ArticleDetailPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/highlights" element={<HighlightsPage />} />
            <Route path="/about" element={<AboutPage />} />
            
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />

            <Route 
              path="/admin" 
              element={
                <AdminLayout>
                  <AdminRoute />
                </AdminLayout>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="articles" element={<AdminArticlesListPage />} />
              <Route path="articles/create" element={<CreateArticlePage />} />
              <Route path="articles/:slug/edit" element={<EditArticlePage />} />
              <Route path="users" element={<AdminUsersListPage />} />
            </Route>

            <Route path="*" element={
              <div className="text-center py-20">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-xl text-slate-600">Sayfa Bulunamadı</p>
                <Link to="/" className="mt-6 inline-block bg-brand-orange hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  Anasayfaya Dön
                </Link>
              </div>
            } />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
