# ECNN Backend

ECNN (E-Commerce News Network) backend API servisi.

## Teknolojiler

- Node.js
- Express.js
- AWS DynamoDB
- AWS S3
- JWT Authentication

## Kurulum

1. Repository'yi klonlayın:
```bash
git clone https://github.com/yourusername/ecnn-backend.git
cd ecnn-backend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Environment değişkenlerini ayarlayın:
```bash
cp .env.example .env
```
`.env` dosyasını düzenleyin ve gerekli değişkenleri ayarlayın.

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

## API Endpoints

- `GET /api` - API durumunu kontrol et
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/articles` - Tüm makaleleri listele
- `GET /api/articles/:slug` - Makale detayı
- `POST /api/admin/articles/create` - Yeni makale oluştur
- `PUT /api/admin/articles/:slug/edit` - Makale düzenle
- `DELETE /api/admin/articles/:slug/delete` - Makale sil

## Deployment

Bu proje Vercel üzerinde deploy edilmiştir. Her push işleminden sonra otomatik olarak deploy edilir.

## Lisans

MIT 