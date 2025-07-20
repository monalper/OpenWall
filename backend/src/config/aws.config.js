// backend/src/config/aws.config.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { S3Client } = require("@aws-sdk/client-s3");

const region = process.env.AWS_REGION || "eu-north-1";

// AWS SDK v3 client'ları
// Vercel deployment için credentials environment variables'dan alınacak
const dynamoDBClient = new DynamoDBClient({ 
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

const s3Client = new S3Client({ 
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  forcePathStyle: false,
  signatureVersion: 'v4',
  computeChecksums: false
});

module.exports = {
  docClient,
  s3Client,
  USERS_TABLE: process.env.DYNAMODB_USERS_TABLE || 'OpenWallUsers',
  ARTICLES_TABLE: process.env.DYNAMODB_ARTICLES_TABLE || 'OpenWallArticles',
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'openwall',
};