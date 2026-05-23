const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only JPG/PNG/WebP images are allowed'));
  },
});

// POST /api/upload/wheel-photo
router.post('/wheel-photo', upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const ext = path.extname(req.file.originalname).toLowerCase();
  const filename = `wheel-photos/${uuidv4()}${ext}`;

  try {
    const { error } = await supabase.storage
      .from('wheel-photos')
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
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
