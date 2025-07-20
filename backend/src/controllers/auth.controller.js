// backend/src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { docClient, USERS_TABLE } = require('../config/aws.config');
const { PutCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

exports.register = async (req, res, next) => {
  // Sadece admin yeni kullanıcı (özellikle başka adminler) oluşturabilir.
  // `req.user` verifyToken ve isAdmin middleware'lerinden gelir ve mevcut admini temsil eder.
  const { username, email, password, name, isAdmin: makeAdmin = false, bio = '' } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Kullanıcı adı, e-posta ve şifre alanları zorunludur.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır.' });
  }

  try {
    // E-posta veya kullanıcı adı zaten var mı kontrol et
    const emailCheckParams = {
      TableName: USERS_TABLE,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :emailVal',
      ExpressionAttributeValues: { ':emailVal': email },
    };
    const { Items: existingEmailUsers } = await docClient.send(new QueryCommand(emailCheckParams));
    if (existingEmailUsers && existingEmailUsers.length > 0) {
      return res.status(409).json({ message: 'Bu e-posta adresi zaten kayıtlı.' });
    }

    const usernameCheckParams = {
      TableName: USERS_TABLE,
      IndexName: 'UsernameIndex',
      KeyConditionExpression: 'username = :usernameVal',
      ExpressionAttributeValues: { ':usernameVal': username },
    };
    const { Items: existingUsernameUsers } = await docClient.send(new QueryCommand(usernameCheckParams));
    if (existingUsernameUsers && existingUsernameUsers.length > 0) {
      return res.status(409).json({ message: 'Bu kullanıcı adı zaten alınmış.' });
    }

    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 12); // Şifrelenmiş parola
    const now = new Date().toISOString();

    const newUser = {
      userId,
      username,
      email,
      passwordHash,
      name: name || username,
      avatarUrl: '', // Varsayılan veya boş
      createdAt: now,
      updatedAt: now,
      logCount: 0,
      reviewCount: 0,
      listCount: 0,
      followerCount: 0,
      followingCount: 0,
      watchlistCount: 0,
      isVerified: false, // E-posta doğrulaması eklenebilir
      isAdmin: makeAdmin, // Admin tarafından oluşturuluyorsa true olabilir
      pinnedLogId: '',
      bio
    };

    const putParams = {
      TableName: USERS_TABLE,
      Item: newUser,
    };
    await docClient.send(new PutCommand(putParams));
    
    const { passwordHash: _, ...userToReturn } = newUser; // passwordHash'i yanıttan çıkar

    res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu.', user: userToReturn });
  } catch (error) {
    console.error("Register Error:", error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'E-posta ve şifre zorunludur.' });
  }

  try {
    const params = {
      TableName: USERS_TABLE,
      IndexName: 'EmailIndex', // E-posta ile kullanıcıyı bul
      KeyConditionExpression: 'email = :emailVal',
      ExpressionAttributeValues: { ':emailVal': email },
    };
    const { Items } = await docClient.send(new QueryCommand(params));

    if (!Items || Items.length === 0) {
      return res.status(401).json({ message: 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.' });
    }
    const user = Items[0];

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Geçersiz şifre.' });
    }

    const token = jwt.sign(
      { userId: user.userId, username: user.username, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token geçerlilik süresi
    );

    const { passwordHash, ...userToReturn } = user;

    res.status(200).json({ 
      message: 'Giriş başarılı.', 
      token, 
      user: userToReturn 
    });
  } catch (error) {
    console.error("Login Error:", error);
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  // verifyToken middleware'i req.user'ı zaten doldurdu (passwordHash olmadan).
  if (!req.user) {
    // Bu durum normalde verifyToken'da yakalanır ama ekstra kontrol.
    return res.status(404).json({ message: 'Kullanıcı bilgisi bulunamadı.' });
  }
  res.status(200).json({ user: req.user });
};
