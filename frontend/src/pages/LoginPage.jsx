// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // AuthContext'ten login fonksiyonu
import api from '../services/api';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // AuthContext'ten login fonksiyonu

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (error) setError(''); // Hata varsa ve kullanıcı yazmaya başlarsa hatayı temizle
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!credentials.email || !credentials.password) {
      setError('E-posta ve şifre alanları zorunludur.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/login', credentials);
      const data = response.data;
      
      login(data.token, data.user);

      if (data.user && data.user.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }

    } catch (err) {
      console.error("Giriş yapılırken hata:", err);
      setError(err.response?.data?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin veya daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ECNN Admin Paneli
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Yönetici girişi yapın
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">E-posta</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand-orange focus:border-brand-orange focus:z-10 sm:text-sm"
                placeholder="E-posta"
                value={credentials.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Şifre</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brand-orange focus:border-brand-orange focus:z-10 sm:text-sm"
                placeholder="Şifre"
                value={credentials.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-orange hover:bg-brand-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
