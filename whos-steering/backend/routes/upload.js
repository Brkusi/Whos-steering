const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const BLOCKED_EXTENSIONS = /\.(?:php\d*|phtml|phar|jsp|jspx|jsw|jsv|jspf)(?:\.|$)/i;

function detectedImageType(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null;
  // Server-side source files hidden in image polyglots must never reach public
  // storage, even though the bucket serves images with nosniff semantics.
  const scriptSample = buffer.subarray(0, Math.min(buffer.length, 1024 * 1024)).toString('latin1').toLowerCase();
  if (scriptSample.includes('<?php') || scriptSample.includes('<%@') || scriptSample.includes('<jsp:')) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: '.jpg', mime: 'image/jpeg' };
  }
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return buffer.subarray(12, 16).toString('ascii') === 'IHDR'
      ? { ext: '.png', mime: 'image/png' }
      : null;
  }
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') {
    return { ext: '.webp', mime: 'image/webp' };
  }
  return null;
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE, files: 1, fields: 10 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (BLOCKED_EXTENSIONS.test(file.originalname) || !allowed.includes(ext) || !MIME_TYPES.has(file.mimetype)) {
      const error = new Error('Only JPG, PNG, and WebP image files are allowed');
      error.status = 415;
      return cb(error);
    }
    cb(null, true);
  },
});

// POST /api/upload/wheel-photo
router.post('/wheel-photo', upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  // Extension and browser MIME values are attacker-controlled. Verify the
  // bytes and derive the stored type from the file signature instead.
  const imageType = detectedImageType(req.file.buffer);
  if (!imageType || imageType.mime !== req.file.mimetype) {
    return res.status(415).json({ error: 'The uploaded file is not a valid supported image' });
  }
  const filename = `wheel-photos/${uuidv4()}${imageType.ext}`;

  try {
    const { error } = await supabase.storage
      .from('wheel-photos')
      .upload(filename, req.file.buffer, {
        contentType: imageType.mime,
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from('wheel-photos')
      .getPublicUrl(filename);

    res.json({ url: data.publicUrl });
  } catch (err) {
    console.error('Supabase storage upload error:', err);
    res.status(500).json({ error: 'File upload failed' });
  }
});

module.exports = router;
module.exports.detectedImageType = detectedImageType;
