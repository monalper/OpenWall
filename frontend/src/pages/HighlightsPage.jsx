import React, { useState, useEffect } from 'react';
import ArticleCard from '../components/article/ArticleCard';
import api from '../services/api';

const HighlightsPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHighlightedArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/articles/highlights');
        setArticles(response.data);
      } catch (err) {
        console.error("Öne çıkan makaleler yüklenirken hata:", err.response?.data?.message || err.message);
        setError(err.response?.data?.message || 'Öne çıkan makaleler yüklenemedi.');
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlightedArticles();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto"></div>
        <p className="mt-4 text-lg font-semibold text-text-muted">Öne Çıkan Makaleler Yükleniyor...</p>
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

  // Hero ve diğer makaleler ayrımı
  const heroArticle = articles[0];
  const otherArticles = articles.slice(1);

  return (
    <div className="min-h-screen bg-site-background">
      {/* Hero Section - Minimal & Professional */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {heroArticle ? (
          <section className="flex flex-col md:flex-row items-center gap-10 py-12 md:py-20">
            {/* Cover Image */}
            <div className="w-full md:w-[480px] h-[260px] md:h-[340px] rounded-3xl overflow-hidden bg-slate-200 shadow-sm flex-shrink-0">
              <img
                src={heroArticle.coverImage || `https://placehold.co/800x500/E2E8F0/A0AEC0?text=${encodeURIComponent(heroArticle.title.substring(0,20))}`}
                alt={heroArticle.title}
                className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
            </div>
            {/* Info */}
            <div className="flex-1 flex flex-col justify-center items-start max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
                {heroArticle.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-6 line-clamp-4">
                {heroArticle.description || (heroArticle.content ? heroArticle.content.substring(0, 180) + '...' : '')}
              </p>
              <div className="flex items-center gap-4 mb-8 text-sm text-gray-400">
                {heroArticle.author?.name && <span className="font-medium text-gray-500">{heroArticle.author.name}</span>}
                {heroArticle.createdAt && <span className="">{new Date(heroArticle.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short', day: 'numeric' })}</span>}
              </div>
              <a
                href={`/articles/${heroArticle.slug}`}
                className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-8 rounded-full text-base transition-colors shadow-none focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Oku
              </a>
            </div>
          </section>
        ) : (
          <div className="relative z-10 text-center w-full py-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">
              <span className="font-['Lora'] italic">Highlights</span>
            </h1>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto">
              Öne çıkan makalelerimizi keşfedin.
            </p>
          </div>
        )}
      </div>

      {/* Articles Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {articles.length === 0 && !loading && (
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold text-text-muted">
              Henüz Öne Çıkan Makale Yok
            </h2>
            <p className="text-slate-500 mt-2">
              Yakında burada öne çıkan makaleler olacak!
            </p>
          </div>
        )}
        {otherArticles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {otherArticles.map(article => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HighlightsPage; 