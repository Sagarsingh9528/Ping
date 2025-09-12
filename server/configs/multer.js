import multer from "multer";
import path from "path";
import fs from "fs";

const isVercel = Boolean(process.env.VERCEL);

// ✅ Writable path
const uploadDir = isVercel
  ? "/tmp/uploads"                           // 🔹 Vercel temp folder (allowed)
  : path.join(process.cwd(), "uploads");      // 🔹 Local dev folder

// ✅ Sirf tab mkdir karo jab path /tmp ho ya local ho
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);
  if (extname && mimetype) cb(null, true);
  else cb(new Error("Only images are allowed"), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
