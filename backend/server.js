// Simple Express backend for PhotoShare (demo)
// Stores uploaded files to ./uploads and metadata to db.json
// Usage: npm install && node server.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const shortid = require('shortid');

const app = express();
const PORT = process.env.PORT || 4000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const DB_FILE = path.join(__dirname, 'db.json');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]', 'utf8');

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(UPLOAD_DIR));

// helper: read/write database (very simple JSON store)
function readDB() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const id = shortid.generate();
    const ext = path.extname(file.originalname) || '';
    cb(null, id + ext);
  }
});
const upload = multer({ storage });

// POST /api/upload  -> creator uploads an image with fields title, caption
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const db = readDB();
  const id = path.parse(req.file.filename).name;
  const item = {
    id,
    filename: req.file.filename,
    url: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`,
    title: req.body.title || '',
    caption: req.body.caption || '',
    createdAt: new Date().toISOString(),
    comments: [],
    likes: 0
  };
  db.unshift(item); // newest first
  writeDB(db);
  res.json(item);
});

// GET /api/images  -> list images
app.get('/api/images', (req, res) => {
  const db = readDB();
  res.json(db);
});

// GET /api/images/:id -> single image + comments
app.get('/api/images/:id', (req, res) => {
  const db = readDB();
  const item = db.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// POST /api/images/:id/comments  -> add comment { author, text }
app.post('/api/images/:id/comments', (req, res) => {
  const { author = 'Anonymous', text } = req.body || {};
  if (!text || text.trim() === '') return res.status(400).json({ error: 'Empty comment' });
  const db = readDB();
  const itemIndex = db.findIndex(i => i.id === req.params.id);
  if (itemIndex === -1) return res.status(404).json({ error: 'Not found' });
  const comment = { id: shortid.generate(), author, text, createdAt: new Date().toISOString() };
  db[itemIndex].comments.push(comment);
  writeDB(db);
  res.json(comment);
});

// POST /api/images/:id/like -> increment likes
app.post('/api/images/:id/like', (req, res) => {
  const db = readDB();
  const itemIndex = db.findIndex(i => i.id === req.params.id);
  if (itemIndex === -1) return res.status(404).json({ error: 'Not found' });
  db[itemIndex].likes = (db[itemIndex].likes || 0) + 1;
  writeDB(db);
  res.json({ likes: db[itemIndex].likes });
});

// health
app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
