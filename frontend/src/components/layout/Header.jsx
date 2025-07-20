// ECNN - Kopya/frontend/src/components/layout/Header.jsx
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-site-background dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 fixed top-0 left-0 right-0 z-50 h-16 md:h-20 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
        {/* Sol: Menü ve Site Başlığı */}
        <div className="flex items-center space-x-4 md:space-x-6 flex-1">
          <Link to="/" className="header-site-title text-xl md:text-2xl font-bold font-logo text-text-heading tracking-tight mr-6">
            openwall
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4 text-sm font-sans font-bold tracking-extrawidest uppercase text-text-muted">
          {/* Navigation links removed as requested */}
          </nav>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-text-muted hover:text-text-main transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {/* Sağ: Tema Butonu */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Açık tema' : 'Karanlık tema'}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange"
          >
            {theme === 'dark' ? (
              // Güneş simgesi (açık tema)
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.05 17.95l-1.414 1.414M17.95 17.95l-1.414-1.414M6.05 6.05L4.636 7.464M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              // Ay simgesi (karanlık tema)
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
              </svg>
            )}
          </button>
          
          {/* Admin ve Çıkış Butonları (isteğe bağlı, tasarımda yok ama işlevsel olabilir) */}
          {/* Bu kısım tasarımda olmadığı için yorum satırı yapıldı, gerekirse aktif edilebilir. */}
          {/* {!loading && user && (
            <div className="flex items-center space-x-2">
              {user.isAdmin && (
                <Link 
                  to="/admin/dashboard" 
                  className="hidden sm:inline-block text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1.5 rounded-md transition-colors"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-xs font-medium text-white bg-red-500 hover:bg-red-600 px-2.5 py-1.5 rounded-md transition-colors"
              >
                Çıkış
              </button>
            </div>
          )}
          {!loading && !user && (
             <Link 
              to="/login" 
              className="text-xs font-medium text-white bg-green-600 hover:bg-green-700 px-2.5 py-1.5 rounded-md transition-colors"
            >
              Giriş
            </Link>
          )}
          */}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg">
          <nav className="container mx-auto px-4 py-3 flex flex-col space-y-3">
            <Link 
              to="/" 
              className="header-nav-link text-sm font-bold tracking-extrawidest uppercase text-text-muted hover:text-text-main transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              BLOG
            </Link>
            <Link 
              to="/highlights" 
              className="header-nav-link text-sm font-bold tracking-extrawidest uppercase text-text-muted hover:text-text-main transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              HIGHLIGHTS
            </Link>
            <Link 
              to="/about" 
              className="header-nav-link text-sm font-bold tracking-extrawidest uppercase text-text-muted hover:text-text-main transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ABOUT
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
