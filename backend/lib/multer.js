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

export default imageUpload;
