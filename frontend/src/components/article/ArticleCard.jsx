import React from 'react';
import { Link } from 'react-router-dom';

const ArticleCard = ({ article }) => {
  const displayDescription = article.description || (article.content ? article.content.substring(0, 120) + '...' : '');
  const placeholderImage = `https://placehold.co/400x400/E2E8F0/A0AEC0?text=${encodeURIComponent(article.title.substring(0,15))}`;

  return (
    <Link
      to={`/articles/${article.slug}`}
      className="overflow-hidden"
      aria-label={`Makaleyi oku: ${article.title}`}
      style={{ boxShadow: 'none' }}
    >
      <div className="w-full aspect-[5/4] bg-black dark:bg-slate-800">
        <img
          src={article.coverImage || placeholderImage}
          alt={`Kapak görseli: ${article.title}`}
          className="w-full h-full object-cover object-center"
          style={{ display: 'block' }}
          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = placeholderImage; }}
          loading="lazy"
        />
      </div>
      <div className="px-0 pt-3 pb-0 text-left">
        <h3 className="text-[20px] font-extrabold text-[#181818] dark:text-slate-200 mb-2 leading-snug">{article.title}</h3>
        <p className="text-[15px] text-[#7b7b7b] dark:text-slate-400 line-clamp-2 leading-normal font-bold">{displayDescription}</p>

      </div>
    </Link>
  );
};

export default ArticleCard;
