// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api'; // Oluşturduğumuz API servisi
import { jwtDecode } from 'jwt-decode'; // JWT'yi decode etmek için

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true); // İlk yükleme ve token doğrulama için

  const initializeAuth = useCallback(async () => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // Token süresinin dolup dolmadığını kontrol et
        if (decodedToken.exp * 1000 < Date.now()) {
          console.log("Token süresi dolmuş, çıkış yapılıyor.");
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
          delete api.defaults.headers.common['Authorization']; // Axios header'dan token'ı kaldır
          setLoading(false);
          return;
        }
        
        // Token geçerliyse, API header'ına ekle
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Kullanıcı bilgilerini /auth/me endpoint'inden çek
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        console.error("Token doğrulama veya kullanıcı bilgisi alma hatası:", error.response?.data?.message || error.message);
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
      }
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]); // initializeAuth'ı dependency array'e ekledik

  const login = useCallback((newToken, userData) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    setUser(userData);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    // İsteğe bağlı: Kullanıcıyı login sayfasına yönlendir
    // Bu yönlendirme genellikle Header veya korumalı rota bileşenlerinde yapılır.
    // window.location.href = '/login'; // Direkt yönlendirme yerine state değişikliği ile tetiklenmeli
  }, []);

  // Admin tarafından yeni kullanıcı (veya admin) oluşturma fonksiyonu
  const registerAdminUser = useCallback(async (newUserData) => {
    // Bu fonksiyon çağrılmadan önce, çağıran yerde mevcut kullanıcının admin olup olmadığı kontrol edilmeli.
    if (!user || !user.isAdmin) {
      throw new Error("Yetkisiz işlem: Sadece adminler yeni kullanıcı oluşturabilir.");
    }
    try {
      // Backend'deki /auth/register endpoint'i verifyToken ve isAdmin middleware'lerini kullanıyor.
      const response = await api.post('/auth/register', newUserData);
      return response.data; // Başarılı olursa mesaj ve oluşturulan kullanıcı bilgisi (passwordHash olmadan)
    } catch (error) {
      console.error("Admin kullanıcı oluşturma hatası:", error.response?.data?.message || error.message);
      // Hata objesini olduğu gibi fırlat ki çağıran bileşen yakalayıp kullanıcıya gösterebilsin
      throw error.response?.data || { message: error.message || "Bilinmeyen bir hata oluştu." };
    }
  }, [user]); // user dependency'si eklendi

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, registerAdminUser, setUser, initializeAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth hook, AuthProvider ile sarmalanmış bir bileşen içinde kullanılmalıdır.');
  }
  return context;
};
