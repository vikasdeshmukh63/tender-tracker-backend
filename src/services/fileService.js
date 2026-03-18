import { Client } from "minio";

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: Number(process.env.MINIO_PORT || 9000),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
});

const bucketName = process.env.MINIO_BUCKET || "tender-files";

// Ensure bucket exists at startup (best-effort)
minioClient.bucketExists(bucketName, (err, exists) => {
  if (err && err.code !== "NoSuchBucket") {
    console.error("MinIO bucketExists error:", err);
    return;
  }
  if (!exists) {
    minioClient.makeBucket(bucketName, "", (createErr) => {
      if (createErr) {
        console.error("MinIO makeBucket error:", createErr);
      } else {
        console.log(`MinIO bucket '${bucketName}' created`);
      }
    });
  }
});

export const getUploadPath = (objectName) => {
  // For multer's diskStorage we don't use a local path anymore.
  // This function is kept for compatibility but not used with MinIO.
  return objectName;
};

export const uploadBufferToMinio = async (objectName, buffer, mimeType) => {
  await minioClient.putObject(bucketName, objectName, buffer, {
    "Content-Type": mimeType || "application/octet-stream",
  });
  return getPublicUrlForFile(objectName);
};

export const getPublicUrlForFile = (objectName) => {
  const scheme = process.env.MINIO_USE_SSL === "true" ? "https" : "http";
  const host = process.env.MINIO_PUBLIC_HOST || process.env.MINIO_ENDPOINT || "localhost";
  const port = process.env.MINIO_PUBLIC_PORT || process.env.MINIO_PORT || 9000;
  return `${scheme}://${host}:${port}/${bucketName}/${encodeURIComponent(objectName)}`;
};

/**
 * Generate a time-limited presigned GET URL for a MinIO object.
 * @param {string} objectName  – the MinIO key (e.g. "tender-attachments/2/file.pdf")
 * @param {number} expiry      – seconds until the URL expires (default 1 hour)
 */
export const getPresignedUrl = (objectName, expiry = 3600) => {
  return new Promise((resolve, reject) => {
    minioClient.presignedGetObject(bucketName, objectName, expiry, (err, url) => {
      if (err) reject(err);
      else resolve(url);
    });
  });
};

/**
 * Delete an object from MinIO by its object name.
 * Resolves silently if the object does not exist (idempotent).
 */
export const deleteFromMinio = (objectName) => {
  return new Promise((resolve, reject) => {
    minioClient.removeObject(bucketName, objectName, (err) => {
      if (err) {
        // "NoSuchKey" means it was already gone — treat as success
        if (err.code === "NoSuchKey" || err.code === "NoSuchObject") {
          resolve();
        } else {
          reject(err);
        }
      } else {
        resolve();
      }
    });
  });
};


