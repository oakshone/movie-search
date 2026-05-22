const watchlistDiv = document.getElementById("watchlist");

async function renderWatchlist() {
  watchlistDiv.innerHTML = "";
  let watchlist;
  try {
    const response = await fetch("http://localhost:3000/api/watchlist");
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    watchlist = await response.json();
  } catch (err) {
    watchlistDiv.innerHTML =
      "<p>Could not connect to server. Make sure the server is running.</p>";
    return;
  }

  if (watchlist.length === 0) {
    watchlistDiv.innerHTML =
      "<p>No movies saved yet. Search for a movie and click '✓ Add to Watchlist'.</p>";
    return;
  }

  watchlist.forEach((movie) => {
    // build 5 stars — filled up to the saved rating, empty beyond it
    let stars = "";
    for (let i = 1; i <= 5; i++) {
      stars += `<span class="star" data-id="${movie._id}" data-value="${i}">${i <= movie.rating ? "★" : "☆"}</span>`;
    }

    const card = document.createElement("div");
    card.className = "movie-card";
    card.innerHTML = `
      <img src="${movie.poster !== "N/A" ? movie.poster : "placeholder.png"}" alt="${movie.title}" onerror="this.src='placeholder.png'">
      <h3>${movie.title}</h3>
      <p>${movie.year}</p>
      <p>${movie.genre}</p>
      <div class="stars">${stars}</div>
      <button class="remove-btn" data-id="${movie._id}">Remove</button>
    `;
    watchlistDiv.appendChild(card);
  });

  // star click — send PATCH with the chosen rating
  document.querySelectorAll(".star").forEach((star) => {
    star.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      const value = e.target.dataset.value;
      fetch(`http://localhost:3000/api/watchlist/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: Number(value) }),
      }).then(() => {
        renderWatchlist();
      });
    });
  });

  // remove button — send DELETE then re-render
  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      fetch(`http://localhost:3000/api/watchlist/${id}`, {
        method: "DELETE",
      }).then(() => {
        renderWatchlist();
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", renderWatchlist);
