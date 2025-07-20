// ECNN - Kopya/frontend/src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import ArticleCard from '../components/article/ArticleCard';
import api from '../services/api';
import Fuse from 'fuse.js';

const HomePage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [fuse, setFuse] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/articles');
        setArticles(response.data);
        setFilteredArticles(response.data);
        // Fuse.js ayarları
        const fuseInstance = new Fuse(response.data, {
          keys: ['title', 'description'],
          threshold: 0.4, // daha düşük: daha hassas, daha yüksek: daha toleranslı
          minMatchCharLength: 2,
        });
        setFuse(fuseInstance);
      } catch (err) {
        console.error("Makaleler yüklenirken hata:", err.response?.data?.message || err.message);
        setError(err.response?.data?.message || 'Makaleler yüklenemedi.');
        setArticles([]);
        setFilteredArticles([]);
        setFuse(null);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredArticles(articles);
    } else if (fuse) {
      const results = fuse.search(searchQuery);
      setFilteredArticles(results.map(r => r.item));
    }
  }, [searchQuery, articles, fuse]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto"></div>
        <p className="mt-4 text-lg font-semibold text-text-muted">Makaleler Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">Bir Hata Oluştu</h2>
        <p className="text-text-muted">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-site-background dark:bg-slate-900">
      {/* Hero Section - OpenWall Grid Style */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
  {/* White border in dark mode around hero */}
  <div className="relative rounded-3xl transition-colors dark:border dark:border-white/20 mb-8">
    <div className="relative h-[340px] md:h-[400px] flex items-center justify-center bg-[#101624] rounded-3xl overflow-hidden">
      {/* Grid background */}
       <div className="absolute inset-0 z-0">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="#2a3140"
                strokeWidth="2"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      {/* Centered text and search */}
            {/* Centered text and search */}
            <div className="relative z-10 text-center w-full flex flex-col items-center justify-center">
              <span className="text-white text-5xl md:text-6xl font-bold">
                Open
                <span className="italic font-serif font-normal">Wall</span>
              </span>
              <div className="w-[280px] sm:w-[320px] md:w-[360px] mt-8 mx-auto px-2 sm:px-0">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Yazılarda ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg bg-white dark:bg-slate-800 rounded-full shadow-md focus:ring-2 focus:ring-brand-orange/30 outline-none transition-all duration-200 placeholder:text-slate-400"
                  />
                  <div className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 sm:p-0"
                      >
                        <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    <svg
                      className="w-7 h-7 sm:w-6 sm:h-6 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div style={{ minHeight: '22px' }}>
                  {searchQuery && (
                    <p className="text-xs text-slate-300 mt-2 text-center">
                      {filteredArticles.length} sonuç
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Articles Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredArticles.length === 0 && !loading && (
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold text-text-muted">
              {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz Makale Yok'}
            </h2>
            <p className="text-slate-500 mt-2">
              {searchQuery ? 'Farklı anahtar kelimelerle tekrar deneyin' : 'Yakında burada harika içerikler olacak!'}
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {filteredArticles.map(article => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
