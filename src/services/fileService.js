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


