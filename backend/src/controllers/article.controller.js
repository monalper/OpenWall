// backend/src/controllers/article.controller.js
const slugify = require('slugify'); // URL dostu slug'lar için
const { docClient, ARTICLES_TABLE, USERS_TABLE } = require('../config/aws.config');
const { PutCommand, GetCommand, ScanCommand, DeleteCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

// Yardımcı fonksiyon: Slug oluşturma
// Not: Slug'ın benzersizliği veritabanı seviyesinde (primary key) sağlanır.
// Eğer aynı başlıkla birden fazla makale oluşturulmaya çalışılırsa DynamoDB hata verecektir.
// Gerekirse, slug'a uuid veya tarih ekleyerek benzersizlik garanti altına alınabilir.
// Şimdilik, slugify ile basit bir dönüşüm yapıyoruz.
function createSlug(title) {
  if (!title) return '';
  return slugify(title, { lower: true, strict: true, locale: 'tr' });
}

exports.createArticle = async (req, res, next) => {
  const { title, description, content, coverImage, status = 'draft' } = req.body;
  const authorId = req.user.userId; // verifyToken middleware'inden gelir

  if (!title || !content) {
    return res.status(400).json({ message: 'Başlık ve içerik alanları zorunludur.' });
  }

  try {
    const slug = createSlug(title);
    if (!slug) { // slugify boş bir başlık için boş string dönebilir
        return res.status(400).json({ message: 'Geçerli bir başlık girilmelidir (slug oluşturulamadı).' });
    }
    const now = new Date().toISOString();

    const newArticle = {
      slug, // Primary Key
      title,
      description: description || content.substring(0, 200), // Otomatik açıklama (ilk 200 karakter)
      content,
      coverImage: coverImage || '', // S3 URL'si
      authorId, // Users tablosundaki userId'ye referans
      status, // 'draft' veya 'published'
      createdAt: now,
      updatedAt: now,
    };

    const putParams = {
      TableName: ARTICLES_TABLE,
      Item: newArticle,
      ConditionExpression: "attribute_not_exists(slug)" // Slug'ın benzersiz olmasını garantile
    };
    
    await docClient.send(new PutCommand(putParams));
    res.status(201).json(newArticle);
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      return res.status(409).json({ message: 'Bu başlıkla bir makale zaten mevcut. Lütfen farklı bir başlık seçin (slug çakışması).' });
    }
    console.error("Create Article Error:", error);
    next(error);
  }
};

exports.updateArticle = async (req, res, next) => {
  const { slug: currentSlug } = req.params; // Düzenlenecek makalenin mevcut slug'ı
  const { title, description, content, coverImage, status } = req.body;
  // const editorUserId = req.user.userId; // Makaleyi düzenleyen kullanıcı (isAdmin ile zaten yetkili)

  if (!title && !description && !content && coverImage === undefined && status === undefined) {
    return res.status(400).json({ message: 'Güncellenecek en az bir alan gönderilmelidir.' });
  }

  try {
    const getParams = { TableName: ARTICLES_TABLE, Key: { slug: currentSlug } };
    const { Item: existingArticle } = await docClient.send(new GetCommand(getParams));

    if (!existingArticle) {
      return res.status(404).json({ message: 'Güncellenecek makale bulunamadı.' });
    }

    // Eğer başlık değişiyorsa ve slug'ın da değişmesi gerekiyorsa, bu durum daha karmaşıktır
    // çünkü primary key (slug) doğrudan güncellenemez. Yeni bir item oluşturup eskiyi silmek gerekir.
    // Bu örnekte, slug'ın sabit kaldığını varsayıyoruz. Eğer başlık değişse bile slug aynı kalır.
    // Eğer slug'ın da değişmesi isteniyorsa, create + delete mantığı uygulanmalıdır.
    // Şimdilik slug'ı değiştirmiyoruz.

    const now = new Date().toISOString();
    
    let updateExpressionParts = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    if (title !== undefined) {
      updateExpressionParts.push('#t = :title');
      expressionAttributeNames['#t'] = 'title';
      expressionAttributeValues[':title'] = title;
    }
    if (description !== undefined) {
      updateExpressionParts.push('#d = :description');
      expressionAttributeNames['#d'] = 'description';
      expressionAttributeValues[':description'] = description;
    }
    if (content !== undefined) {
      updateExpressionParts.push('#c = :content');
      expressionAttributeNames['#c'] = 'content';
      expressionAttributeValues[':content'] = content;
    }
    if (coverImage !== undefined) {
      updateExpressionParts.push('#ci = :coverImage');
      expressionAttributeNames['#ci'] = 'coverImage';
      expressionAttributeValues[':coverImage'] = coverImage;
    }
    if (status !== undefined) {
      updateExpressionParts.push('#s = :status');
      expressionAttributeNames['#s'] = 'status';
      expressionAttributeValues[':status'] = status;
    }
    
    updateExpressionParts.push('#ua = :updatedAt');
    expressionAttributeNames['#ua'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = now;

    if (updateExpressionParts.length === 1 && updateExpressionParts[0].startsWith('#ua')) { // Sadece updatedAt güncelleniyorsa
        return res.status(200).json(existingArticle); // Değişiklik yok gibi kabul edilebilir veya sadece updatedAt güncellenir.
    }


    const updateParams = {
      TableName: ARTICLES_TABLE,
      Key: { slug: currentSlug },
      UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW', // Güncellenmiş item'ı döndür
    };

    const { Attributes: updatedArticle } = await docClient.send(new UpdateCommand(updateParams));
    res.status(200).json(updatedArticle);

  } catch (error) {
    console.error("Update Article Error:", error);
    next(error);
  }
};

exports.deleteArticle = async (req, res, next) => {
  const { slug } = req.params;
  try {
    const getParams = { TableName: ARTICLES_TABLE, Key: { slug } };
    const { Item: existingArticle } = await docClient.send(new GetCommand(getParams));

    if (!existingArticle) {
      return res.status(404).json({ message: 'Silinecek makale bulunamadı.' });
    }
    
    const deleteParams = { TableName: ARTICLES_TABLE, Key: { slug } };
    await docClient.send(new DeleteCommand(deleteParams));
    res.status(200).json({ message: `'${slug}' başlıklı makale başarıyla silindi.` });
  } catch (error) {
    console.error("Delete Article Error:", error);
    next(error);
  }
};

exports.listPublishedArticles = async (req, res, next) => {
  try {
    const params = {
      TableName: ARTICLES_TABLE,
      FilterExpression: '#st = :status_val', // status bir keyword olabilir, #st kullandık
      ExpressionAttributeNames: { '#st': 'status' },
      ExpressionAttributeValues: { ':status_val': 'published' },
      // ProjectionExpression: 'slug, title, description, coverImage, authorId, createdAt' // İstenen alanlar
    };
    // Not: Scan operasyonu tüm tabloyu tarar. Büyük tablolarda performans sorunlarına yol açabilir.
    // Daha iyi bir çözüm, 'status' ve 'createdAt' alanlarını içeren bir Global Secondary Index (GSI) oluşturmaktır.
    // Örneğin: GSI Adı: StatusDateIndex, Partition Key: status (S), Sort Key: createdAt (S)
    // Bu GSI ile Query operasyonu kullanılabilir: KeyConditionExpression: "#st = :status_val" ve ScanIndexForward: false (tersten sıralama)
    const { Items } = await docClient.send(new ScanCommand(params));
    
    // Geçici olarak client-side sıralama (GSI kullanılması şiddetle önerilir)
    const sortedItems = Items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(sortedItems);
  } catch (error) {
    console.error("List Published Articles Error:", error);
    next(error);
  }
};

// Yardımcı fonksiyon: Makaleye yazar bilgilerini eklemek için
async function enrichArticleWithAuthor(article) {
    if (article && article.authorId) {
        try {
            const authorParams = { TableName: USERS_TABLE, Key: { userId: article.authorId }};
            const { Item: author } = await docClient.send(new GetCommand(authorParams));
            if (author) {
                const { passwordHash, ...authorDetails } = author; // Hassas bilgileri çıkar
                article.author = authorDetails; // Makaleye yazar objesini ekle
            }
        } catch (authorError) {
            console.warn(`Yazar bilgisi getirilemedi (authorId: ${article.authorId}):`, authorError.message);
            // Yazar bilgisi olmasa da makaleyi döndürmeye devam et
        }
    }
    return article;
}


exports.getArticleBySlug = async (req, res, next) => {
  const { slug } = req.params;
  const isAdminUser = req.user && req.user.isAdmin; // Token varsa ve adminse

  try {
    const params = {
      TableName: ARTICLES_TABLE,
      Key: { slug },
    };
    let { Item: article } = await docClient.send(new GetCommand(params));

    if (!article) {
      return res.status(404).json({ message: 'Makale bulunamadı.' });
    }

    // Eğer kullanıcı admin değilse ve makale 'published' değilse, gösterme
    if (!isAdminUser && article.status !== 'published') {
      return res.status(404).json({ message: 'Makale bulunamadı veya henüz yayınlanmamış.' });
    }
    
    article = await enrichArticleWithAuthor(article);

    res.status(200).json(article);
  } catch (error) {
    console.error("Get Article By Slug Error:", error);
    next(error);
  }
};

// Admin için tüm makaleleri listele (taslaklar dahil)
exports.listAllArticlesForAdmin = async (req, res, next) => {
  try {
    const params = {
      TableName: ARTICLES_TABLE,
    };
    const { Items } = await docClient.send(new ScanCommand(params));
    // Client-side sıralama (GSI daha iyi performans sağlar)
    const sortedItems = Items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(sortedItems);
  } catch (error) {
    console.error("List All Articles (Admin) Error:", error);
    next(error);
  }
};

// Admin için makale detayı (taslaklar dahil)
exports.getArticleBySlugForAdmin = async (req, res, next) => {
    const { slug } = req.params;
    try {
      const params = {
        TableName: ARTICLES_TABLE,
        Key: { slug },
      };
      let { Item: article } = await docClient.send(new GetCommand(params));
  
      if (!article) {
        return res.status(404).json({ message: 'Makale bulunamadı.' });
      }
      
      article = await enrichArticleWithAuthor(article);
      res.status(200).json(article);
    } catch (error) {
      console.error("Get Article By Slug (Admin) Error:", error);
      next(error);
    }
};

// Makale öne çıkarma durumunu değiştir
exports.toggleArticleHighlight = async (req, res, next) => {
  const { slug } = req.params;
  const { isHighlighted } = req.body;

  try {
    // Önce makalenin var olup olmadığını kontrol et
    const getParams = { TableName: ARTICLES_TABLE, Key: { slug } };
    const { Item: existingArticle } = await docClient.send(new GetCommand(getParams));

    if (!existingArticle) {
      return res.status(404).json({ message: 'Makale bulunamadı.' });
    }

    // Makalenin öne çıkarma durumunu güncelle
    const updateParams = {
      TableName: ARTICLES_TABLE,
      Key: { slug },
      UpdateExpression: 'SET isHighlighted = :isHighlighted, updatedAt = :now',
      ExpressionAttributeValues: {
        ':isHighlighted': isHighlighted,
        ':now': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    const { Attributes: updatedArticle } = await docClient.send(new UpdateCommand(updateParams));
    res.status(200).json(updatedArticle);
  } catch (error) {
    console.error("Toggle Article Highlight Error:", error);
    next(error);
  }
};

// Öne çıkan makaleleri getir
exports.getHighlightedArticles = async (req, res, next) => {
  try {
    const params = {
      TableName: ARTICLES_TABLE,
      FilterExpression: 'isHighlighted = :isHighlighted AND #st = :status',
      ExpressionAttributeNames: {
        '#st': 'status'
      },
      ExpressionAttributeValues: {
        ':isHighlighted': true,
        ':status': 'published'
      }
    };

    const { Items } = await docClient.send(new ScanCommand(params));
    
    // Makaleleri tarihe göre sırala (en yeni en üstte)
    const sortedItems = Items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Her makale için yazar bilgilerini ekle
    const articlesWithAuthors = await Promise.all(
      sortedItems.map(article => enrichArticleWithAuthor(article))
    );

    res.status(200).json(articlesWithAuthors);
  } catch (error) {
    console.error("Get Highlighted Articles Error:", error);
    next(error);
  }
};