// frontend/src/pages/admin/AdminArticlesListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext'; // Token vs. için gerekebilir

const AdminArticlesListPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // const { token } = useAuth(); // Eğer API isteği için token gerekiyorsa (api.js zaten hallediyor)
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchAdminArticles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Admin için tüm makaleleri (taslaklar dahil) getiren endpoint
      // Backend'deki /api/admin/articles endpoint'i verifyToken ve isAdmin middleware'lerini kullanıyor.
      const response = await api.get('/admin/articles');
      setArticles(response.data);
    } catch (err) {
      console.error("Admin makaleleri yüklenirken hata:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Makaleler yüklenemedi.');
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Yetkisiz erişim durumunda login sayfasına yönlendirilebilir.
        // navigate('/login');
      }
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]); // navigate dependency'si eklendi (eğer yönlendirme yapılırsa)

  useEffect(() => {
    fetchAdminArticles();
  }, [fetchAdminArticles]);

  const handleDeleteArticle = async (slugToDelete, articleTitle) => {
    // Basit bir confirm yerine daha şık bir modal kullanılabilir.
    if (window.confirm(`'${articleTitle}' başlıklı makaleyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      try {
        await api.delete(`/admin/articles/${slugToDelete}/delete`);
        // alert('Makale başarıyla silindi.'); // Daha iyi bir notification sistemi (örn: react-toastify)
        // Listeyi yenile
        setArticles(prevArticles => prevArticles.filter(article => article.slug !== slugToDelete));
      } catch (err) {
        console.error("Makale silinirken hata:", err.response?.data?.message || err.message);
        setError(`Makale silinemedi: ${err.response?.data?.message || err.message}`);
        // alert(`Makale silinemedi: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const toggleHighlight = async (articleSlug, currentHighlightStatus) => {
    try {
      const response = await api.put(`/admin/articles/${articleSlug}/highlight`, { isHighlighted: !currentHighlightStatus });

      // Update local state
      setArticles(articles.map(article => 
        article.slug === articleSlug 
          ? { ...article, isHighlighted: !currentHighlightStatus }
          : article
      ));
    } catch (err) {
      console.error('Error toggling highlight:', err);
      setError('Öne çıkarma durumu güncellenirken bir hata oluştu.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
        <p className="text-slate-600">Makaleler Yükleniyor...</p>
      </div>
    );
  }
  
  // Hata mesajı için ayrı bir bölüm
  {error && (
    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
      {error}
    </div>
  )}

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Makale Yönetimi</h1>
        <Link
          to="/admin/articles/create"
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out text-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
          Yeni Makale Ekle
        </Link>
      </div>
      
      {!loading && !error && articles.length === 0 ? (
        <p className="text-center text-slate-500 py-8">Henüz oluşturulmuş bir makale yok. İlk makalenizi ekleyebilirsiniz!</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <div className="min-w-full divide-y divide-slate-200">
            {/* Table Header - Hidden on mobile */}
            <div className="hidden md:block bg-slate-50">
              <div className="grid grid-cols-12 gap-4 px-5 py-3.5">
                <div className="col-span-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Başlık</div>
                <div className="col-span-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Durum</div>
                <div className="col-span-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Oluşturulma Tarihi</div>
                <div className="col-span-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Son Güncelleme</div>
                <div className="col-span-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">İşlemler</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="bg-white divide-y divide-slate-200">
              {articles.map((article) => (
                <div key={article.slug} className="hover:bg-slate-50 transition-colors">
                  {/* Mobile View */}
                  <div className="md:hidden p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-slate-800">{article.title}</h3>
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {article.status === 'published' ? 'Yayında' : 'Taslak'}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p>Oluşturulma: {new Date(article.createdAt).toLocaleDateString('tr-TR')}</p>
                      <p>Son Güncelleme: {new Date(article.updatedAt).toLocaleDateString('tr-TR')}</p>
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        onClick={() => toggleHighlight(article.slug, article.isHighlighted)}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          article.isHighlighted
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {article.isHighlighted ? 'Öne Çıkarıldı' : 'Öne Çıkar'}
                      </button>
                      <Link
                        to={`/admin/articles/${article.slug}/edit`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Düzenle
                      </Link>
                      <button
                        onClick={() => handleDeleteArticle(article.slug, article.title)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Sil
                      </button>
                    </div>
                  </div>

                  {/* Desktop View */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-4">
                    <div className="col-span-4">
                      <h3 className="font-medium text-slate-800">{article.title}</h3>
                    </div>
                    <div className="col-span-2">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {article.status === 'published' ? 'Yayında' : 'Taslak'}
                      </span>
                    </div>
                    <div className="col-span-2 text-sm text-slate-600">
                      {new Date(article.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                    <div className="col-span-2 text-sm text-slate-600">
                      {new Date(article.updatedAt).toLocaleDateString('tr-TR')}
                    </div>
                    <div className="col-span-2 text-center space-x-3">
                      <button
                        onClick={() => toggleHighlight(article.slug, article.isHighlighted)}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          article.isHighlighted
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {article.isHighlighted ? 'Öne Çıkarıldı' : 'Öne Çıkar'}
                      </button>
                      <Link
                        to={`/admin/articles/${article.slug}/edit`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Düzenle
                      </Link>
                      <button
                        onClick={() => handleDeleteArticle(article.slug, article.title)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminArticlesListPage;
