// --------------------------------------------------
// CONFIG
// --------------------------------------------------
const API_BASE = "https://photoshare-ew4g.onrender.com"; 
// ← your actual backend base URL on Render

// --------------------------------------------------
// VIEW SWITCHING
// --------------------------------------------------
function showCreator() {
    document.getElementById("creator").classList.remove("hidden");
    document.getElementById("consumer").classList.add("hidden");
}

function showConsumer() {
    document.getElementById("consumer").classList.remove("hidden");
    document.getElementById("creator").classList.add("hidden");
    loadFeed();
}

// --------------------------------------------------
// UPLOAD PHOTO
// matches: POST /api/upload
// --------------------------------------------------
async function uploadPhoto() {
    const file = document.getElementById("fileInput").files[0];

    if (!file) {
        alert("Select an image first!");
        return;
    }

    const formData = new FormData();
    formData.append("file", file); // backend expects 'file'

    const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData
    });

    const data = await res.json();
    document.getElementById("uploadStatus").innerText =
        data.error ? `Error: ${data.error}` : "Uploaded successfully!";
}

// --------------------------------------------------
// LOAD FEED
// matches: GET /api/images
// --------------------------------------------------
async function loadFeed() {
    const res = await fetch(`${API_BASE}/api/images`);
    const photos = await res.json();

    const feed = document.getElementById("feed");
    feed.innerHTML = "";

    photos.forEach(photo => {
        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            <img src="${API_BASE}/uploads/${photo.filename}">
            <button class="btn" onclick="likePhoto('${photo.id}')">
                ❤️ Like (${photo.likes})
            </button>

            <p>Comments:</p>
            ${
                photo.comments
                    .map(c => `<p>• ${c.text}</p>`)
                    .join("")
            }

            <input id="c${photo.id}" placeholder="Write comment...">
            <button class="btn" onclick="commentPhoto('${photo.id}')">
                Comment
            </button>
        `;

        feed.appendChild(div);
    });
}

// --------------------------------------------------
// LIKE PHOTO
// matches: POST /api/images/:id/like
// --------------------------------------------------
async function likePhoto(id) {
    await fetch(`${API_BASE}/api/images/${id}/like`, {
        method: "POST"
    });

    loadFeed();
}

// --------------------------------------------------
// COMMENT PHOTO
// matches: POST /api/images/:id/comments
// --------------------------------------------------
async function commentPhoto(id) {
    const input = document.getElementById("c" + id);
    const text = input.value.trim();

    if (!text) return;

    await fetch(`${API_BASE}/api/images/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
    });

    input.value = "";
    loadFeed();
}
