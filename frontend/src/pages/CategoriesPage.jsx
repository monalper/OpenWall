// ECNN - Kopya/frontend/src/pages/CategoriesPage.jsx (Yeni Dosya)
import React from 'react';
import { Link } from 'react-router-dom';

const CategoriesPage = () => {
  // TODO: Backend'den kategoriler çekilecek ve listelenecek
  const categories = [
    { name: 'Teknoloji', slug: 'teknoloji', count: 12 },
    { name: 'Sanat', slug: 'sanat', count: 8 },
    { name: 'Felsefe', slug: 'felsefe', count: 15 },
    { name: 'Bilim', slug: 'bilim', count: 5 },
  ];

  return (
    <div className="py-8 md:py-12">
      <h1 className="text-4xl md:text-5xl font-bold text-text-heading mb-10 text-center font-logo">
        Kategoriler
      </h1>
      <div className="max-w-3xl mx-auto">
        {categories.length > 0 ? (
          <ul className="space-y-4">
            {categories.map(category => (
              <li key={category.slug} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <Link to={`/category/${category.slug}`} className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-brand-orange hover:text-orange-700">{category.name}</h2>
                  <span className="text-sm text-text-muted bg-slate-100 px-2 py-1 rounded-full">{category.count} makale</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-text-muted">Henüz kategori bulunmamaktadır.</p>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
