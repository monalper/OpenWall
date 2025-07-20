// frontend/src/pages/admin/AdminDashboardPage.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, linkTo, bgColor = "bg-blue-500" }) => (
  <Link to={linkTo} className={`block p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 ${bgColor} text-white`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-3xl md:text-4xl font-bold">{value}</p>
        <p className="text-sm font-medium uppercase tracking-wider">{title}</p>
      </div>
      {icon && <div className="text-4xl opacity-80">{icon}</div>}
    </div>
  </Link>
);


const AdminDashboardPage = () => {
  const { user } = useAuth();
  // TODO: Backend'den gerçek istatistikler çekilecek (toplam makale, kullanıcı vb.)
  const stats = {
    totalArticles: 0, // Örnek
    publishedArticles: 0,
    draftArticles: 0,
    totalUsers: 0,
  };

  // useEffect içinde API'dan bu verileri çekebilirsiniz.

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Admin Gösterge Paneli</h1>
        <p className="text-base md:text-lg text-slate-600 mt-2">Hoş geldiniz, <span className="font-semibold">{user?.name || user?.username}</span>! OpenWall platformunu buradan yönetebilirsiniz.</p>
      </div>
      
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard title="Toplam Makale" value={stats.totalArticles} icon="📰" linkTo="/admin/articles" bgColor="bg-sky-500" />
        <StatCard title="Toplam Kullanıcı" value={stats.totalUsers} icon="👥" linkTo="/admin/users" bgColor="bg-emerald-500" />
        <StatCard title="Yeni Makale Oluştur" value="+" icon="✏️" linkTo="/admin/articles/create" bgColor="bg-amber-500" />
      </div>

      {/* Hızlı İşlemler Bölümü */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <Link to="/admin/articles/create" className="flex items-center p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Yeni Makale Yaz
          </Link>
          <Link to="/admin/articles" className="flex items-center p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Makaleleri Yönet
          </Link>
          <Link to="/admin/users" className="flex items-center p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Kullanıcıları Görüntüle
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
