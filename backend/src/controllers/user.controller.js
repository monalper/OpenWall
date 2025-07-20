const { docClient, USERS_TABLE } = require('../config/aws.config');
const { GetCommand, ScanCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

// Public: Kullanıcı profilini username ile getir
exports.getUserProfileByUsername = async (req, res, next) => {
  const { username } = req.params;
  try {
    const params = {
      TableName: USERS_TABLE,
      IndexName: 'UsernameIndex', // DynamoDB'de tanımladığınız GSI adı
      KeyConditionExpression: 'username = :usernameVal',
      ExpressionAttributeValues: { ':usernameVal': username },
      // Sadece public olarak gösterilecek alanları seçin
      ProjectionExpression: 'userId, username, name, avatarUrl, bio, createdAt, logCount, reviewCount, listCount, followerCount, followingCount, watchlistCount, pinnedLogId'
    };
    const { Items } = await docClient.send(new QueryCommand(params));

    if (!Items || Items.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    // `passwordHash`, `email`, `isAdmin`, `isVerified` gibi alanlar ProjectionExpression ile zaten gelmiyor.
    const userProfile = Items[0]; 
    res.status(200).json(userProfile);
  } catch (error) {
    console.error("Get User Profile Error:", error);
    next(error);
  }
};

// Admin: Tüm kullanıcıları listele
exports.listAllUsers = async (req, res, next) => {
  try {
    const params = {
      TableName: USERS_TABLE,
      // Admin panelinde gösterilecek alanlar. `passwordHash` hariç tutulmalı.
      ProjectionExpression: 'userId, username, email, name, isAdmin, isVerified, createdAt, updatedAt'
    };
    const { Items } = await docClient.send(new ScanCommand(params));
    
    // Scan tüm tabloyu tarar, çok sayıda kullanıcı varsa GSI ile daha verimli sorgular düşünülebilir.
    // Şimdilik `passwordHash` zaten ProjectionExpression ile gelmiyor.
    res.status(200).json(Items || []);
  } catch (error) {
    console.error("List All Users Error:", error);
    next(error);
  }
};

// Admin: Kullanıcının admin yetkisini değiştir (toggle)
exports.toggleUserAdminStatus = async (req, res, next) => {
  const { userId } = req.params; // Admin yetkisi değiştirilecek kullanıcının ID'si
  const adminPerformingAction = req.user; // İşlemi yapan admin

  // Kendi admin yetkisini değiştirmesini engelle
  if (adminPerformingAction.userId === userId) {
    return res.status(400).json({ message: 'Kendi admin yetkinizi bu arayüzden değiştiremezsiniz.' });
  }

  try {
    const getParams = { TableName: USERS_TABLE, Key: { userId } };
    const { Item: userToUpdate } = await docClient.send(new GetCommand(getParams));

    if (!userToUpdate) {
      return res.status(404).json({ message: 'Yetkisi değiştirilecek kullanıcı bulunamadı.' });
    }

    const newIsAdminStatus = !userToUpdate.isAdmin; // Mevcut durumun tersini al

    const updateParams = {
      TableName: USERS_TABLE,
      Key: { userId },
      UpdateExpression: 'SET isAdmin = :newStatus, updatedAt = :now',
      ExpressionAttributeValues: {
        ':newStatus': newIsAdminStatus,
        ':now': new Date().toISOString(),
      },
      ReturnValues: 'UPDATED_NEW', // Sadece güncellenen attributeları döndür
    };
    const { Attributes: updatedAttributes } = await docClient.send(new UpdateCommand(updateParams));
    
    // Güncellenmiş kullanıcı bilgisini (passwordHash olmadan) döndür
    const { passwordHash, ...safeUpdatedUser } = { ...userToUpdate, ...updatedAttributes };


    res.status(200).json({ 
      message: `Kullanıcı '${userToUpdate.username}' için admin yetkisi başarıyla '${newIsAdminStatus ? 'verildi' : 'alındı'}'.`,
      user: safeUpdatedUser
    });
  } catch (error) {
    console.error("Toggle Admin Status Error:", error);
    next(error);
  }
};