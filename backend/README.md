Simple backend for PhotoShare demo.

Run locally:
  cd backend
  npm install
  npm start

Endpoints:
  POST /api/upload            multipart/form-data { file, title, caption }
  GET  /api/images
  GET  /api/images/:id
  POST /api/images/:id/comments   JSON { author, text }
  POST /api/images/:id/like

Note: This stores uploads in ./uploads and metadata in db.json — fine for demos, not production.
