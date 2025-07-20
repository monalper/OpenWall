# ECNN - Film ve Dizi İnceleme Platformu

Bu proje, film ve diziler hakkında inceleme yapabileceğiniz, listeler oluşturabileceğiniz ve diğer kullanıcılarla etkileşime geçebileceğiniz bir platformdur.

## Teknolojiler

### Frontend
- React
- Vite
- TailwindCSS
- Axios
- React Router
- TipTap Editor

### Backend
- Node.js
- Express.js
- AWS DynamoDB
- AWS S3
- JWT Authentication

## Kurulum

### Backend
```bash
cd backend
npm install
# .env dosyasını oluşturun ve gerekli environment variable'ları ekleyin
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# .env dosyasını oluşturun ve gerekli environment variable'ları ekleyin
npm run dev
```

## Environment Variables

### Backend (.env)
```
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=eu-north-1
DYNAMODB_USERS_TABLE=OpenWallUsers
DYNAMODB_ARTICLES_TABLE=OpenWallArticles
S3_BUCKET_NAME=your_bucket_name
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Deployment

Proje Vercel üzerinde deploy edilmiştir:
- Frontend: https://ecnn.vercel.app
- Backend: https://ecnn-backend.vercel.app

## Lisans

MIT 