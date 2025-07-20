// frontend/src/pages/admin/CreateArticlePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArticleForm from '../../components/article/ArticleForm';
import api from '../../services/api';

const CreateArticlePage = () => {
  const navigate = useNavigate();
  const [formError, setFormError] = useState(''); // Form seviyesinde genel hata

  const handleCreateArticle = async (articleData) => {
    setFormError(''); // Önceki hataları temizle
    try {
      // Backend'deki /api/admin/articles/create endpoint'i verifyToken ve isAdmin middleware'lerini kullanıyor.
      const response = await api.post('/admin/articles/create', articleData);
      // alert('Makale başarıyla oluşturuldu!'); // Daha iyi bir notification sistemi kullanılmalı
      console.log('Makale oluşturuldu:', response.data);
      // Başarılı oluşturma sonrası admin makale listesine veya düzenleme sayfasına yönlendir
      navigate(`/admin/articles/${response.data.slug}/edit?created=true`); 
      // Veya direkt listeye: navigate('/admin/articles');
    } catch (err) {
      console.error("Makale oluşturulurken hata:", err.response?.data?.message || err.message);
      setFormError(err.response?.data?.message || 'Makale oluşturulamadı. Lütfen alanları kontrol edin.');
      throw err; // ArticleForm'un kendi içindeki loading state'ini yönetmesi için hatayı tekrar fırlat
    }
  };

  return (
    <div className="p-6 md:p-8 rounded-xl shadow-xl">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">Yeni Makale Oluştur</h1>
      <ArticleForm 
        onSubmit={handleCreateArticle} 
        formError={formError}
        setFormError={setFormError}
      />
    </div>
  );
};

export default CreateArticlePage;
