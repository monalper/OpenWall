// frontend/src/components/layout/AdminLayout.jsx
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Çıkış yapmak için

const AdminLayout = ({ children }) => { // children prop'u Outlet tarafından sağlanacak
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const commonLinkClasses = "flex items-center px-3 py-2.5 rounded-lg transition-colors duration-150 ease-in-out text-sm font-medium";
  const activeClassName = "bg-blue-600 text-white shadow-md";
  const inactiveClassName = "text-slate-200 hover:bg-slate-700 hover:text-white";

  // Header yüksekliği (Header.jsx'teki h-16 veya h-20'ye göre ayarlanmalı)
  // Bu değeri bir CSS değişkeni veya context ile global yapmak daha iyi olabilir.
  const headerHeight = "64px"; // md:h-20 için 80px

  return (
    <div className="flex" style={{ minHeight: `calc(100vh - ${headerHeight})` }}> {/* Header yüksekliğini çıkar */}
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-slate-800 text-white md:hidden"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sol Navigasyon Menüsü */}
      <aside className={`fixed top-0 left-0 h-full bg-slate-800 text-white p-4 space-y-2 shadow-lg z-40 transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 w-64 pt-[calc(var(--header-h,64px)+1rem)]`} style={{"--header-h": headerHeight}}> {/* Header yüksekliği kadar padding-top */}
        <div className="mb-4 px-2">
            <p className="text-xs text-slate-400">Hoş geldiniz,</p>
            <p className="font-semibold text-slate-100 truncate">{user?.name || user?.username}</p>
        </div>
        <nav>
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeClassName : inactiveClassName}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {/* SVG icon eklenebilir */}
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            Gösterge Paneli
          </NavLink>
          <NavLink
            to="/admin/articles"
            className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeClassName : inactiveClassName}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Makaleler
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeClassName : inactiveClassName}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Kullanıcılar
          </NavLink>
          {/* Diğer Admin Linkleri */}
        </nav>
        <div className="pt-4 mt-4 border-t border-slate-700">
             <button
                onClick={handleLogout}
                className={`${commonLinkClasses} w-full ${inactiveClassName}`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Çıkış Yap
            </button>
        </div>
      </aside>

      {/* Ana İçerik Alanı (Admin Sayfaları Buraya Render Edilecek) */}
      <div className="flex-1 md:ml-64 p-4 md:p-8 bg-slate-100 overflow-y-auto" style={{ paddingTop: `calc(var(--header-h,64px)+1.5rem)`}}> {/* Header yüksekliği kadar padding-top */}
        {/* children prop'u App.jsx'teki AdminRoute içindeki <Outlet /> ile sağlanır. */}
        {/* <Outlet /> doğrudan AdminRoute içinde olduğu için burada children'a gerek kalmadı. */}
        {children} 
      </div>
    </div>
  );
};

export default AdminLayout;