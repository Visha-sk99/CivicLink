const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Keep files in memory, then stream them to Cloudinary
const parser = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5 MB each, max 5 files
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpe?g|png|webp|gif)$/.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only image files (jpg, png, webp, gif) are allowed'));
  },
});

const uploadBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'civiclink', resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

// After multer parses the files, push each one to Cloudinary
const toCloudinary = async (req, res, next) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    if (!files.length) return next();

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    for (const f of files) {
      const result = await uploadBuffer(f.buffer);
      f.path = result.secure_url; // controllers read file.path
      f.filename = result.public_id;
      delete f.buffer;
    }
    next();
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(502).json({ message: 'Image upload failed' });
  }
};

// Return multer errors (wrong type, too big) as JSON instead of crashing
const safe = (mw) => (req, res, next) =>
  mw(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });

module.exports = {
  any: () => [safe(parser.any()), toCloudinary],
  single: (name) => [safe(parser.single(name)), toCloudinary],
  array: (name, max) => [safe(parser.array(name, max)), toCloudinary],
};