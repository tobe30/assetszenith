import multer from "multer";

const storage = multer.memoryStorage();
const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const imageUpload = multer({
  storage,
  limits: {
    fileSize: MAX_PROFILE_IMAGE_SIZE,
  },
  fileFilter: (req, file, callback) => {
    if (allowedImageTypes.has(file.mimetype)) {
      return callback(null, true);
    }

    return callback(
      new Error("Only JPEG, PNG, and WEBP images are allowed")
    );
  },
});

const MAX_VERIFICATION_DOCUMENT_SIZE = 10 * 1024 * 1024;
const allowedVerificationTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const verificationUpload = multer({
  storage,
  limits: { fileSize: MAX_VERIFICATION_DOCUMENT_SIZE },
  fileFilter: (_req, file, callback) => {
    if (allowedVerificationTypes.has(file.mimetype)) return callback(null, true);
    return callback(new Error("Upload a PDF, JPEG, PNG, or WEBP identity document."));
  },
});

export default imageUpload;
