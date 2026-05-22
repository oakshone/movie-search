# Movie Search App — Architecture & Key Decisions

---

## Project Overview
A vanilla JavaScript movie search app backed by a Node.js/Express REST API and MongoDB Atlas cloud database. Users can search movies via the OMDB API, view details, and manage a personal watchlist that persists to the cloud.

---

## Tech Stack
| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Vanilla JS, HTML, CSS | UI, search, watchlist display |
| Form validation | jQuery + jQuery Validate | Registration form | this is new for us is validating the data we have using the function validate()
| Backend | Node.js + Express | REST API server |
| Database | MongoDB Atlas + Mongoose | Persistent watchlist storage |
| External API | OMDB API | Movie search and detail data |
| Environment | dotenv | Secure credential storage |

---

## File Structure
```
js/server.js       — Express backend (run this to start the API)
js/app.js          — Index page logic (search + add to watchlist)
js/plan.js         — Watchlist page logic (fetch + remove)
js/nav.js          — Shared hamburger menu toggle (all pages)
js/registration.js — jQuery Validate form logic
style.css          — Single shared stylesheet (dark cinema theme)
index.html         — Movie search page
plan.html          — Watchlist page
registration.html  — Account registration page
.env               — MONGO_URI + PORT (gitignored, never commit)
.gitignore         — Excludes .env and node_modules/
```

---

## Backend API (js/server.js)
Three REST routes on port 3000:

| Method | Route | What it does |
|---|---|---|
| GET | `/api/watchlist` | Returns all saved movies |
| POST | `/api/watchlist` | Saves a new movie (checks for duplicate imdbID first) |
| DELETE | `/api/watchlist/:id` | Removes a movie by MongoDB `_id` |

**Duplicate prevention:** POST checks `findOne({ imdbID })` before saving — returns `409` if already exists.

---

## MongoDB Schema (Mongoose)
```js
{ title, year, imdbID, type, poster, genre }  // all String
```
MongoDB auto-generates `_id` on each document — this is what the DELETE route uses, not `imdbID`.

---

## OMDB API — Critical Field Rules
- Search endpoint (`?s=query`) returns: `Title, Year, Poster, imdbID, Type` — **NO Genre, Director, Plot, Actors**
- Detail endpoint (`?i=imdbID`) returns everything including `Genre, Director, Plot, Actors`
- **Always fetch detail (`?i=`) before saving to watchlist** so Genre is captured correctly
- OMDB fields are **capitalized** (Title, Year) — MongoDB stores them **lowercase** (title, year). Map on save.

---

## Frontend Data Flow
1. User searches → OMDB `/s=` → renders cards (Title, Year, Poster only)
2. User clicks card → fetches OMDB `/i=imdbID` → detail panel shows full info
3. "Add to Watchlist" clicked → fetches `/i=imdbID` for full data → POSTs to `localhost:3000/api/watchlist`
4. Watchlist page loads → GETs `localhost:3000/api/watchlist` → renders cards using lowercase MongoDB fields
5. "Remove" clicked → DELETEs by `movie._id` (MongoDB ID, not imdbID)

---

## CSS Architecture (style.css)
- CSS custom properties (variables) in `:root` — change colors/radius in one place
- Dark cinema theme: `--bg: #0f0f0f`, `--surface: #1a1a1a`, `--accent: #e50914` (red)
- Inter font from Google Fonts
- Cards: fixed poster height (`240px`, `object-fit: cover`) for uniform grid
- Detail panel: poster floats left on desktop, stacks on mobile
- Responsive: hamburger nav at ≤768px, 2-column cards at ≤480px

---

## Startup Checklist (development)
1. `cd /Users/kage/Desktop/movie-search`
2. `node js/server.js` — server must be running on port 3000
3. Open `index.html` via **Live Server** (`http://127.0.0.1:5500`) — not `file://` (causes CORS issues)

---

## Key Gotchas
- `actorName` / `genreName` DOM elements don't exist on `index.html` — wrapped in null guards (`if (actorName)`)
- Server must be restarted after any change to `js/server.js` — Node doesn't hot-reload
- If the server was running an old cached version, GET/DELETE routes may be missing — always restart after edits
- `imdbID` field on OMDB detail response is lowercase (`movie.imdbID`) even though other fields are capitalized

---

## JavaScript Syntax — `()` vs `{}` vs `[]`

**`[]` — Square brackets = Arrays**
```js
const movies = ["Inception", "Interstellar"]; // array of items
movies[0]; // access by index
```

**`()` — Parentheses = always about functions**
```js
function greet(name) { ... }  // defining parameters
greet("Jackson");              // calling/invoking with an argument
btn.addEventListener("click", () => { ... }); // arrow function parameters
```

**`{}` — Curly braces = three jobs depending on context**
```js
// 1. Object (your data container — key/value pairs)
const movie = { title: "Inception", year: 2010 };

// 2. Code block (instructions to execute)
function greet() { console.log("hi"); }
if (true) { doSomething(); }

// 3. Destructuring (pulling values OUT of an object)
const { title, year } = movie; // grabs title and year directly
```

**How to tell which `{}` you're looking at:**

| Situation | What it is |
|---|---|
| After `=` or inside `()` | Object (data) |
| After `function`, `if`, `=>`, `for` | Code block |
| After `const` on the left of `=` | Destructuring |

**Real example from this codebase:**
```js
app.post("/api/watchlist", async (req, res) => {
//                                ^^^^^^^^^^  () = parameters
  const movie = { title: req.body.title };
//               ^^^^^^^^^^^^^^^^^^^^^^  {} = object (data)
  if (!movie) { return res.status(404); }
//             ^^^^^^^^^^^^^^^^^^^^^^^^  {} = code block
});
