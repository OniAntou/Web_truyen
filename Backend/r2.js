/**
 * Cloudflare R2 (S3-compatible) client – upload ảnh bìa & ảnh chapter.
 * Dùng @aws-sdk/client-s3 với endpoint R2.
 */
require('dotenv').config();
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET || 'web-truyen-uploads';
const publicUrlBase = process.env.R2_PUBLIC_URL || '';

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
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Chuẩn hóa cover_url hoặc image_url từ DB: nếu là "r2:..." thì trả về signed/public URL.
 */
async function resolveR2Url(stored) {
  if (!stored || typeof stored !== 'string') return stored;
  if (!stored.startsWith('r2:')) return stored;
  return getFileUrl(stored);
}

module.exports = {
  R2_ENABLED,
  uploadToR2,
  getFileUrl,
  resolveR2Url,
  bucket,
};
