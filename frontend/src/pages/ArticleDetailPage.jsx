// ECNN - Kopya/frontend/src/pages/ArticleDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { FaFacebook, FaLinkedin, FaLink, FaWhatsapp, FaTelegram, FaReddit } from 'react-icons/fa';
import { SiX } from 'react-icons/si';
import * as htmlToImage from 'html-to-image';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import api from '../services/api';
import ArticleCard from '../components/article/ArticleCard';

function calculateReadingTime(html) {
  // HTML'den metni çıkar, kelime sayısını bul, 200 wpm ile hesapla
  const text = html.replace(/<[^>]+>/g, ' ');
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} Min`;
}

function injectImageSources(html, imageSources = {}) {
  // DOMParser ile img altına source ekle
  if (typeof window === 'undefined') return html;
  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const imgs = doc.querySelectorAll('img');
  imgs.forEach(img => {
    // data-source attribute'u varsa veya imageSources objesinde varsa
    const src = img.getAttribute('src');
    const source = img.getAttribute('data-source') || imageSources[src];
    if (source) {
      const small = doc.createElement('div');
      small.textContent = `Image Source: ${source}`;
      small.style.fontSize = '12px';
      small.style.color = '#7b7b7b';
      small.style.textAlign = 'center';
      small.style.marginTop = '4px';
      img.insertAdjacentElement('afterend', small);
    }
  });
  return doc.body.innerHTML;
}

const ArticleDetailPage = () => {
  // Scroll yüzde state'i
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Yalnızca body scroll'u için (tüm sayfa)
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      let percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      percent = Math.min(100, Math.max(0, percent));
      setScrollPercent(percent);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // İlk yüklemede de hesapla
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // Tema algıla
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  useEffect(() => {
    const checkDark = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    checkDark();
    // Listen for theme changes via MutationObserver
    const observer = new MutationObserver(() => checkDark());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    // Also listen for storage events (if theme is synced via localStorage)
    window.addEventListener('storage', checkDark);
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', checkDark);
    };
  }, []);
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [articleRes, articlesRes] = await Promise.all([
        api.get(`/articles/${slug}`),
        api.get('/articles')
      ]);
      setArticle(articleRes.data);
      setArticles(articlesRes.data.filter(a => a.slug !== slug));
      setLoading(false);
    };
    fetchData();
  }, [slug]);

  // Twitter/X embedleri için script yükle ve widget'ları başlat
  useEffect(() => {
    if (!article) return;
    // Script zaten yoksa ekle
    if (!window.twttr) {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.id = 'twitter-wjs';
      document.body.appendChild(script);
      script.onload = () => {
        if (window.twttr && window.twttr.widgets) {
          window.twttr.widgets.load();
        }
      };
    } else if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load();
    }
  }, [article]);

  if (loading || !article) {
    return <div className="text-center py-20 text-slate-600">Loading...</div>;
  }

  // Kapak görseli ve image source
  const coverImage = article.coverImage || `https://placehold.co/1200x675/E2E8F0/A0AEC0?text=${encodeURIComponent(article.title.substring(0,25))}`;
  const imageSource = article.imageSource || '';
  // Yazar, tarih, okuma süresi
  const author = article.authorName || article.author?.name || '';
  const date = article.createdAt ? new Date(article.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const readingTime = calculateReadingTime(article.content || '');

  // İçerik görselleri için kaynaklar (örnek: article.contentImages = {src: source})
  const contentWithSources = injectImageSources(article.content || '', article.contentImages);

  // Open Graph ve Twitter Card için meta veriler
  const pageTitle = article?.title || 'Makale';
  const pageDescription = article?.description || (article?.content ? article.content.substring(0, 120) : 'ECNN Makale');
  const pageImage = article?.coverImage || `https://placehold.co/1200x675/E2E8F0/A0AEC0?text=${encodeURIComponent(article?.title?.substring(0,25) || 'Makale')}`;
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <>
      {/* Okuma Yüzdesi Göstergesi - Header'ın tam ortasında */}
      {/* Okuma Yüzdesi Göstergesi - Header ile hizalı, sadece masaüstünde */}
      {/* Okuma Yüzdesi Göstergesi - openwall logosu ile tam hizalı */}
      {/* Okuma Yüzdesi Göstergesi - Sayfa tam ortasında (dikey ve yatay) */}
      {/* Okuma Yüzdesi Göstergesi - Header'ın tam ortasında, container ile hizalı */}
      <div
        className="hidden sm:flex"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '64px', // header yüksekliği
          pointerEvents: 'none',
          zIndex: 1100,
        }}
      >
        <div
          className="container mx-auto px-4 sm:px-6 lg:px-8"
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              color: isDarkMode ? '#facc15' : '#181818',
              fontWeight: 700,
              fontSize: 16,
              background: 'transparent',
              transition: 'color 0.2s',
              pointerEvents: 'none',
              userSelect: 'none',
              textShadow: isDarkMode ? '0 1px 4px #18181899' : 'none',
              whiteSpace: 'nowrap',
              left: '50%',
              transform: 'translateX(-50%) translateY(9px)',
              position: 'absolute',
            }}
          >
            %{Math.round(scrollPercent)} tamamlandı.
          </span>
        </div>
      </div>
      <div className="max-w-2xl w-full mx-auto pt-8">
        <Helmet>
          <title>{article.title} | ECNN</title>
          <meta name="description" content={article.description || article.title} />
          {/* Open Graph Meta Tags */}
          <meta property="og:title" content={article.title} />
          <meta property="og:description" content={article.description || article.title} />
          <meta property="og:image" content={coverImage} />
          <meta property="og:url" content={window.location.href} />
          <meta property="og:type" content="article" />
          {/* Twitter Card Meta Tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={pageTitle} />
          <meta name="twitter:description" content={pageDescription} />
          <meta name="twitter:image" content={pageImage} />
          <meta name="twitter:url" content={pageUrl} />
        </Helmet>
        {/* Kapak görseli */}
        <div className="w-full aspect-[16/9] bg-black flex items-center justify-center">
          <img
            src={coverImage}
            alt="cover"
            className="w-full h-full object-cover object-center"
            style={{ display: 'block' }}
          />
        </div>
        {/* Image source sağ alt */}
        {imageSource && (
          <div className="text-xs text-[#7b7b7b] text-right mt-1 mb-2">Image Source: {imageSource}</div>
        )}
        {/* Yazar, tarih, okuma süresi */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-slate-700 dark:text-slate-300 mt-3 mb-2">
          {author && <span>Author: <span className="font-semibold">{author}</span></span>}
          {date && <span>Date: {date}</span>}
          <span>Reading Time: {readingTime}</span>
        </div>
        {/* Başlık */}
        <h1
          className="font-bold text-slate-900 dark:text-slate-100 mt-4 mb-6 leading-tight break-words"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '40px', fontWeight: 700, lineHeight: 1.15 }}
        >
          {article.title}
        </h1>
        {/* İçerik */}
        <div
          className="prose prose-slate max-w-none mb-10 break-words"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '23px', fontWeight: 400, lineHeight: 1.7, textAlign: 'justify', textJustify: 'inter-word' }}
        >
          <div dangerouslySetInnerHTML={{ __html: contentWithSources }} />
        </div>
        {/* References */}
        {article.references && article.references.length > 0 && (
          <section className="mt-10 mb-12">
            <h2 className="flex items-center gap-2 text-lg font-bold mb-3 text-slate-900 dark:text-slate-100">
              <span className="text-yellow-400 text-xl">📑</span> References
            </h2>
            <ol className="list-decimal pl-6 space-y-1 text-[#7b7b7b] text-[15px]">
              {article.references.map((ref, i) => (
                <li key={i}>{ref}</li>
              ))}
            </ol>
          </section>
        )}
        {/* Paylaşım Önizleme Kartı - makalenin sonunda, genişliği içerik ile aynı */}
        <section className="flex flex-col items-center justify-center my-10">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 max-w-3xl w-full border border-slate-200 dark:border-slate-700 mx-auto">
            <div id="share-preview-card" className="flex flex-col items-center">
              <div className="w-full aspect-[16/9] bg-black rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                <img
                  src={coverImage}
                  alt="cover preview"
                  className="w-full h-full object-cover object-center"
                  style={{ display: 'block' }}
                />
              </div>
              <h2 className="text-xl font-bold mb-2 text-center text-[#181818] dark:text-slate-100">{article.title}</h2>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Yazar: {author}</div>
            </div>

            <div className="flex gap-4 justify-center mt-2 flex-wrap">
              {/* X (Twitter) */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title + '\n\n' + window.location.href)}` }
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X'te paylaş"
                className="hover:bg-sky-100 dark:hover:bg-sky-900 rounded-full p-2 transition-colors"
              >
                <SiX size={28} color={isDarkMode ? '#fff' : '#181818'} />
              </a>
              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook'ta paylaş"
                className="hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full p-2 transition-colors"
              >
                <FaFacebook size={28} color={isDarkMode ? '#fff' : '#181818'} />
              </a>
              {/* LinkedIn */}
              <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(article.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn'de paylaş"
                className="hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full p-2 transition-colors"
              >
                <FaLinkedin size={28} color={isDarkMode ? '#fff' : '#181818'} />
              </a>
              {/* WhatsApp */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp'ta paylaş"
                className="hover:bg-green-100 dark:hover:bg-green-900 rounded-full p-2 transition-colors"
              >
                <FaWhatsapp size={28} color={isDarkMode ? '#fff' : '#181818'} />
              </a>
              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram'da paylaş"
                className="hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full p-2 transition-colors"
              >
                <FaTelegram size={28} color={isDarkMode ? '#fff' : '#181818'} />
              </a>
              {/* Reddit */}
              <a
                href={`https://www.reddit.com/submit?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(article.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Reddit'te paylaş"
                className="hover:bg-orange-100 dark:hover:bg-orange-900 rounded-full p-2 transition-colors"
              >
                <FaReddit size={28} color={isDarkMode ? '#fff' : '#181818'} />
              </a>
              {/* Copy Link (for Instagram or general) */}
              <button
                onClick={() => {navigator.clipboard.writeText(window.location.href); alert('Bağlantı kopyalandı!');}}
                aria-label="Bağlantıyı kopyala"
                className="hover:bg-pink-100 dark:hover:bg-pink-900 rounded-full p-2 transition-colors"
              >
                <FaLink size={28} color={isDarkMode ? '#fff' : '#181818'} />
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">Instagram doğrudan paylaşımı desteklemiyor, bağlantıyı kopyalayıp paylaşabilirsiniz.</div>
          </div>
        </section>
        {/* Other Articles */}
        {articles.length > 0 && (
          <section className="max-w-5xl mx-auto mt-16">
            <h3 className="text-lg font-bold mb-6 text-[#181818] dark:text-slate-100">Other Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {articles.slice(0, 3).map(a => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default ArticleDetailPage;
