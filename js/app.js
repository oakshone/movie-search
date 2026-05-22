const API_KEY = "a291611";
const BASE_URL = "https://www.omdbapi.com/";

// Grab your elements
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const clearBtn = document.getElementById("clear-btn");
const resultsDiv = document.getElementById("results");
const detailDiv = document.getElementById("detail");
const placeholderImg = "placeholder.png";
const actorName = document.getElementById("actor-name");
const genreName = document.getElementById("genre-name");

// Search button click
// event listener for the search button, when clicked, it will execute the function that fetches movies based on the search query entered in the input field. and the query is just the data being recieved by the user input in the search bar, and the trim() method is used to remove any leading or trailing whitespace from the input, ensuring that the search query is clean and doesn't contain unnecessary spaces. if the query is empty after trimming, the function will return early, preventing an unnecessary API call with an empty search term.
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim(); // get the search query and trim whitespace
  if (!query) return; // basic validation
  fetchMovies(query);
});
// Search on Enter key
searchInput.addEventListener("keydown", (e) => {
  // fat arrow function to handle for keydown event on the search input
  if (e.key === "Enter") {
    // check if the key pressed is Enter
    const query = searchInput.value.trim();
    if (!query) return;
    fetchMovies(query);
  }
});

// Clear button click
clearBtn.addEventListener("click", () => {
  resultsDiv.innerHTML = ""; // clear results what does that mean? it means to set the innerHTML of the resultsDiv to an empty string, effectively removing all content from that div.
  detailDiv.innerHTML = ""; // clear detail
  detailDiv.style.display = "none";
  searchInput.value = ""; // clear input
  if (actorName) actorName.textContent = ""; // clear actor name
  if (genreName) genreName.textContent = ""; // clear genre name
});

// Fetch search results
async function fetchMovies(query) {
  // async function to fetch movies based on search query
  const response = await fetch(`${BASE_URL}?s=${query}&apikey=${API_KEY}`);
  const data = await response.json();
  if (data.Search) {
    renderResults(data.Search);
  } else {
    resultsDiv.innerHTML = "<p>No results found.</p>";
  }
}

// Render movie cards
function renderResults(movies) {
  resultsDiv.innerHTML = "";
  movies.forEach((movie) => {
    // fat arrow function to loop through movies single handedly
    const card = document.createElement("div");
    card.className = "movie-card"; // to manipulate the css of the card
    card.innerHTML = `
      <img src="${movie.Poster !== "N/A" ? movie.Poster : "placeholder.png"}" alt="${movie.Title}" onerror="this.src='placeholder.png'">
      <h3>${movie.Title}</h3>
      <p>${movie.Year}</p>
      <button class="watchlist-btn">+ Add to Watchlist</button>
    `;
    card.addEventListener("click", () => fetchDetail(movie.imdbID));
    card
      .querySelector(".watchlist-btn")
      .addEventListener("click", async (e) => {
        e.stopPropagation(); // prevent triggering the card click event
        // fetch full detail so we get Genre (not available in search results)
        const detailRes = await fetch(`${BASE_URL}?i=${movie.imdbID}&apikey=${API_KEY}`);
        const detail = await detailRes.json();
        await fetch("http://localhost:3000/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: detail.Title,
            year: detail.Year,
            imdbID: detail.imdbID,
            type: detail.Type,
            poster: detail.Poster,
            genre: detail.Genre,
          }),
        });
        e.target.textContent = "✓ Added";
        e.target.disabled = true;
      });
    resultsDiv.appendChild(card);
  });
}

// Fetch single movie detail
async function fetchDetail(id) {
  const response = await fetch(`${BASE_URL}?i=${id}&apikey=${API_KEY}`); // fetch the movie detail using the id
  const data = await response.json();
  renderDetail(data);
}

// Render detail panel
async function renderDetail(movie) {
  let alreadySaved = false;
  try {
    const response = await fetch("http://localhost:3000/api/watchlist"); // fetch the watchlist from the server to check if the movie is already in the watchlist
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const watchlist = await response.json();
    alreadySaved = watchlist.some((m) => m.imdbID === movie.imdbID); // check if the movie is already in the watchlist by comparing the imdbID
  } catch (err) {
    console.error("Could not reach watchlist server:", err);
  }

  detailDiv.style.display = "block"; 
  detailDiv.innerHTML = `
    <h2>${movie.Title} (${movie.Year})</h2>
    <img src="${movie.Poster !== "N/A" ? movie.Poster : "placeholder.png"}" alt="${movie.Title}" onerror="this.src='placeholder.png'">
    <p><strong>Director:</strong> ${movie.Director}</p> 
    <p><strong>Plot:</strong> ${movie.Plot}</p>
    <p><strong>Actors:</strong> ${movie.Actors}</p>
    <p><strong>Genre:</strong> ${movie.Genre}</p>
    <button id="watchlist-btn" ${alreadySaved ? "disabled" : ""}>
      ${alreadySaved ? "✓ Added to Watchlist" : "+ Add to Watchlist"}
    </button>
  `;


  if (!alreadySaved) {
    document
      .getElementById("watchlist-btn")
      .addEventListener("click", async () => {
        await fetch("http://localhost:3000/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: movie.Title,
            year: movie.Year,
            imdbID: movie.imdbID,
            type: movie.Type,
            poster: movie.Poster,
            genre: movie.Genre,
          }),
        });
        const btn = document.getElementById("watchlist-btn");
        btn.textContent = "✓ Added to Watchlist";
        btn.disabled = true;
      });
  }
}
