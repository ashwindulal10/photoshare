const API_BASE = "https://photoshare-ew4g.onrender.com";

// Show creator upload view
function showCreator() {
    document.getElementById("creator").classList.remove("hidden");
    document.getElementById("consumer").classList.add("hidden");
}

// Show consumer feed view
function showConsumer() {
    document.getElementById("consumer").classList.remove("hidden");
    document.getElementById("creator").classList.add("hidden");
    loadFeed();
}

// Upload photo
async function uploadPhoto() {
    const file = document.getElementById("fileInput").files[0];
    if (!file) {
        alert("Select an image first!");
        return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
        const res = await fetch(`${API_BASE}/upload`, {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        document.getElementById("uploadStatus").innerText = data.message || "Uploaded!";
    } catch (err) {
        document.getElementById("uploadStatus").innerText = "Upload failed!";
        console.error(err);
    }
}

// Load feed
async function loadFeed() {
    try {
        const res = await fetch(`${API_BASE}/photos`);
        const photos = await res.json();

        const feed = document.getElementById("feed");
        feed.innerHTML = "";

        photos.forEach(photo => {
            const div = document.createElement("div");
            div.className = "card";

            div.innerHTML = `
                <img src="${API_BASE}/uploads/${photo.filename}">
                <button class="btn" onclick="likePhoto('${photo.id}')">❤️ Like (${photo.likes})</button>
                <p>Comments:</p>
                ${photo.comments.map(c => `<p>• ${c}</p>`).join("")}
                <input id="c${photo.id}" placeholder="Write comment...">
                <button class="btn" onclick="commentPhoto('${photo.id}')">Comment</button>
            `;

            feed.appendChild(div);
        });
    } catch (err) {
        console.error("Error loading feed:", err);
    }
}

// Like photo
async function likePhoto(id) {
    try {
        await fetch(`${API_BASE}/like/${id}`, { method: "POST" });
        loadFeed();
    } catch (err) {
        console.error(err);
    }
}

// Comment photo
async function commentPhoto(id) {
    const input = document.getElementById("c" + id);
    const text = input.value.trim();
    if (!text) return;

    try {
        await fetch(`${API_BASE}/comment/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });

        input.value = "";
        loadFeed();
    } catch (err) {
        console.error(err);
    }
}
