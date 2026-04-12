/**
 * Cloudflare R2 (S3-compatible) client – upload ảnh bìa & ảnh chapter.
 * Dùng @aws-sdk/client-s3 với endpoint R2.
 */
require('dotenv').config();
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET || 'web-truyen-uploads';
const publicUrlBase = process.env.R2_PUBLIC_URL || '';
const urlCache = new Map(); // Cache for signed URLs

const endpoint = accountId
  ? `https://${accountId}.r2.cloudflarestorage.com`
  : null;

const s3Client = endpoint && accessKeyId && secretAccessKey
  ? new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  })
  : null;


const R2_ENABLED = Boolean(s3Client && bucket);


/**
 * Upload buffer lên R2.
 * @param {string} key - Key object (vd: covers/comicId/filename.jpg)
 * @param {Buffer} body - Nội dung file
 * @param {string} contentType - MIME type (vd: image/jpeg)
 * @returns {Promise<{ key: string, url: string }>} key và URL (signed hoặc public)
 */
async function uploadToR2(key, body, contentType = 'image/jpeg') {
  if (!R2_ENABLED) {
    throw new Error('R2 chưa được cấu hình. Kiểm tra R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET trong .env');
  }
  await s3Client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
  const url = publicUrlBase
    ? (publicUrlBase.replace(/\/$/, '') + '/' + key)
    : null;
  return { key: 'r2:' + key, url };
}

/**
 * Trả về URL để truy cập file (signed nếu không dùng public bucket).
 * @param {string} keyOrR2Key - key thuần (covers/...) hoặc "r2:covers/..."
 * @param {number} expiresIn - giây (mặc định 1 giờ)
 */
async function getFileUrl(keyOrR2Key, expiresIn = 3600) {
  const key = typeof keyOrR2Key === 'string' && keyOrR2Key.startsWith('r2:')
    ? keyOrR2Key.slice(3)
    : keyOrR2Key;
  if (!key) return null;
  if (!R2_ENABLED) return null;
  
  if (publicUrlBase) {
    return publicUrlBase.replace(/\/$/, '') + '/' + key;
  }

  // Check cache for signed URL
  const now = Date.now();
  const cached = urlCache.get(key);
  if (cached && cached.expires > now + 60000) { // Still valid for at least 60 seconds
    return cached.url;
  }

  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
  
  // Cache for slightly less than expiration time
  urlCache.set(key, {
    url: signedUrl,
    expires: now + (expiresIn * 1000)
  });
  
  return signedUrl;
}

/**
 * Chuẩn hóa cover_url hoặc image_url từ DB: nếu là "r2:..." thì trả về signed/public URL.
 */
async function resolveR2Url(stored) {
  if (!stored || typeof stored !== 'string') return stored;
  if (!stored.startsWith('r2:')) return stored;
  return getFileUrl(stored);
}

/**
 * Xoá file khỏi R2.
 * @param {string} keyOrR2Key - key thuần (covers/...) hoặc "r2:covers/..."
 */
async function deleteFromR2(keyOrR2Key) {
  if (!R2_ENABLED) return;
  const key = typeof keyOrR2Key === 'string' && keyOrR2Key.startsWith('r2:')
    ? keyOrR2Key.slice(3)
    : keyOrR2Key;
  if (!key) return;
  
  try {
    const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
    await s3Client.send(command);
  } catch (err) {
    console.error(`Lỗi khi xoá file trên R2 (${key}):`, err);
  }
}

/**
 * Download file từ R2 trả về Buffer.
 */
async function downloadFromR2(keyOrR2Key) {
  if (!R2_ENABLED) return null;
  const key = typeof keyOrR2Key === 'string' && keyOrR2Key.startsWith('r2:')
    ? keyOrR2Key.slice(3)
    : keyOrR2Key;
  if (!key) return null;

  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3Client.send(command);
    
    // Chuyển stream sang buffer
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (err) {
    console.error(`Lỗi khi tải file từ R2 (${key}):`, err);
    return null;
  }
}

module.exports = {
  R2_ENABLED,
  uploadToR2,
  getFileUrl,
  resolveR2Url,
  deleteFromR2,
  downloadFromR2,
  bucket,
};
