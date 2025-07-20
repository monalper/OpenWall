// frontend/src/pages/admin/AdminUsersListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
// import { Link } from 'react-router-dom'; // Yeni kullanıcı oluşturma formu için gerekebilir
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext'; // registerAdminUser fonksiyonu için

const AdminUsersListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser, registerAdminUser } = useAuth(); // registerAdminUser AuthContext'ten

  // Yeni kullanıcı oluşturma formu için state'ler
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', name: '', isAdmin: false, bio: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Backend'deki /api/admin/users endpoint'i verifyToken ve isAdmin middleware'lerini kullanıyor.
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error("Kullanıcılar yüklenirken hata:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Kullanıcılar yüklenemedi.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleAdminStatus = async (userIdToToggle, currentIsAdmin, username) => {
    const actionText = currentIsAdmin ? 'admin yetkisini almaktan' : 'admin yapmaktan';
    if (window.confirm(`'${username}' adlı kullanıcıyı ${actionText} emin misiniz?`)) {
      try {
        // Backend'deki /api/admin/users/:userId/promote endpoint'i
        const response = await api.patch(`/admin/users/${userIdToToggle}/promote`);
        // alert(response.data.message); // Daha iyi bir notification
        // Listeyi yenilemek yerine direkt state'i güncelle
        setUsers(prevUsers => 
          prevUsers.map(u => u.userId === userIdToToggle ? { ...u, isAdmin: !currentIsAdmin, updatedAt: new Date().toISOString() } : u)
        );
      } catch (err) {
        console.error(`Kullanıcı admin durumu değiştirilirken hata:`, err.response?.data?.message || err.message);
        setError(`İşlem başarısız: ${err.response?.data?.message || err.message}`);
        // alert(`İşlem başarısız: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleNewUserChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUser(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (createError) setCreateError('');
    if (createSuccess) setCreateSuccess('');
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.password) {
        setCreateError('Kullanıcı adı, e-posta ve şifre alanları zorunludur.');
        return;
    }
    setCreateLoading(true);
    setCreateError('');
    setCreateSuccess('');
    try {
      const response = await registerAdminUser(newUser); // AuthContext'teki fonksiyonu kullan
      setCreateSuccess(response.message || 'Yeni kullanıcı başarıyla oluşturuldu!');
      setShowCreateForm(false); // Formu kapat
      setNewUser({ username: '', email: '', password: '', name: '', isAdmin: false, bio: '' }); // Formu sıfırla
      fetchUsers(); // Kullanıcı listesini yenile
    } catch (err) {
      console.error("Yeni kullanıcı oluşturulurken hata:", err);
      setCreateError(err.message || err.error || 'Kullanıcı oluşturulamadı. Lütfen alanları kontrol edin.');
    } finally {
      setCreateLoading(false);
    }
  };
  
  const inputClass = "block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";


  if (loading && users.length === 0) { // Sadece ilk yüklemede tam sayfa yükleme göster
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
        <p className="text-slate-600">Kullanıcılar Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Kullanıcı Yönetimi</h1>
          <button
            onClick={() => {setShowCreateForm(!showCreateForm); setCreateError(''); setCreateSuccess('');}}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z"></path></svg>
            {showCreateForm ? 'Formu Kapat' : 'Yeni Kullanıcı Ekle'}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateUserSubmit} className="mb-8 p-4 md:p-6 border border-slate-200 rounded-lg space-y-4 bg-slate-50">
            <h2 className="text-xl font-semibold text-slate-700 border-b pb-2 mb-4">Yeni Kullanıcı Oluştur</h2>
            {createError && <p className="p-2 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">{createError}</p>}
            {createSuccess && <p className="p-2 text-sm text-green-700 bg-green-100 border border-green-200 rounded-md">{createSuccess}</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="usernameCreate" className={labelClass}>Kullanıcı Adı (*)</label>
                <input type="text" name="username" id="usernameCreate" value={newUser.username} onChange={handleNewUserChange} required className={inputClass}/>
              </div>
              <div>
                <label htmlFor="emailCreate" className={labelClass}>E-posta (*)</label>
                <input type="email" name="email" id="emailCreate" value={newUser.email} onChange={handleNewUserChange} required className={inputClass}/>
              </div>
              <div>
                <label htmlFor="passwordCreate" className={labelClass}>Şifre (*)</label>
                <input type="password" name="password" id="passwordCreate" value={newUser.password} onChange={handleNewUserChange} required className={inputClass} placeholder="En az 6 karakter"/>
              </div>
              <div>
                <label htmlFor="nameCreate" className={labelClass}>İsim (Görünecek Ad)</label>
                <input type="text" name="name" id="nameCreate" value={newUser.name} onChange={handleNewUserChange} className={inputClass}/>
              </div>
            </div>
            <div>
              <label htmlFor="bioCreate" className={labelClass}>Biyografi</label>
              <textarea name="bio" id="bioCreate" value={newUser.bio} onChange={handleNewUserChange} rows="2" className={inputClass}></textarea>
            </div>
            <div className="flex items-center pt-2">
              <input type="checkbox" name="isAdmin" id="isAdminCreate" checked={newUser.isAdmin} onChange={handleNewUserChange} className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"/>
              <label htmlFor="isAdminCreate" className="ml-2 block text-sm text-slate-800 font-medium">Bu kullanıcıya Admin Yetkisi Ver</label>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={createLoading} className="flex items-center justify-center min-w-[150px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm hover:shadow-md disabled:opacity-60 transition-all">
                {createLoading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Kullanıcıyı Oluştur'}
              </button>
            </div>
          </form>
        )}
        
        {error && !showCreateForm && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading && users.length > 0 && <p className="text-sm text-slate-500 mb-2">Liste güncelleniyor...</p>}
        
        {!loading && !error && users.length === 0 && !showCreateForm ? (
          <p className="text-center text-slate-500 py-8">Sistemde kayıtlı kullanıcı bulunmamaktadır.</p>
        ) : users.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <div className="min-w-full divide-y divide-slate-200">
              {/* Table Header - Hidden on mobile */}
              <div className="hidden md:block bg-slate-50">
                <div className="grid grid-cols-12 gap-4 px-5 py-3.5">
                  <div className="col-span-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Kullanıcı Adı</div>
                  <div className="col-span-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">E-posta</div>
                  <div className="col-span-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">İsim</div>
                  <div className="col-span-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin?</div>
                  <div className="col-span-1 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">İşlemler</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="bg-white divide-y divide-slate-200">
                {users.map((user) => (
                  <div key={user.userId} className="hover:bg-slate-50 transition-colors">
                    {/* Mobile View */}
                    <div className="md:hidden p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-slate-800">{user.username}</h3>
                          <p className="text-sm text-slate-600">{user.email}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {user.isAdmin ? 'Admin' : 'Kullanıcı'}
                        </span>
                      </div>
                      {user.name && (
                        <p className="text-sm text-slate-600">İsim: {user.name}</p>
                      )}
                      {currentUser && currentUser.userId !== user.userId && (
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => handleToggleAdminStatus(user.userId, user.isAdmin, user.username)}
                            className={`text-sm font-medium ${
                              user.isAdmin ? 'text-orange-600 hover:text-orange-800' : 'text-teal-600 hover:text-teal-800'
                            }`}
                          >
                            {user.isAdmin ? 'Yetkiyi Al' : 'Admin Yap'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-4">
                      <div className="col-span-3">
                        <p className="font-medium text-slate-800">{user.username}</p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-slate-600">{user.email}</p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-slate-600">{user.name || '-'}</p>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {user.isAdmin ? 'Evet' : 'Hayır'}
                        </span>
                      </div>
                      <div className="col-span-1 text-center">
                        {currentUser && currentUser.userId !== user.userId ? (
                          <button
                            onClick={() => handleToggleAdminStatus(user.userId, user.isAdmin, user.username)}
                            className={`text-sm font-medium ${
                              user.isAdmin ? 'text-orange-600 hover:text-orange-800' : 'text-teal-600 hover:text-teal-800'
                            }`}
                          >
                            {user.isAdmin ? 'Yetkiyi Al' : 'Admin Yap'}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">(Kendiniz)</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersListPage;
