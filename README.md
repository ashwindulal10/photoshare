PhotoShare — Simple demo app (frontend + backend)

Backend: simple Node/Express saving uploads to ./backend/uploads and metadata to ./backend/db.json
Frontend: static index.html

To run locally:
  1) Backend:
     cd backend
     npm install
     npm start
  2) Frontend:
     open frontend/index.html in your browser OR serve it with: npx serve frontend

To deploy:
  - Backend: push backend folder to GitHub and deploy on Render (web service).
  - Frontend: push frontend to GitHub and deploy on Vercel (static site). Replace the BASE URL in frontend/index.html with your backend URL.
