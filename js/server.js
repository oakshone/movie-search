const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

mongoose
  .connect(process.env.MONGO_URI) // this function is to connect to the MongoDB I have setup. You may ask what is MongoURI it is all my personal information linked to my personal database for this project we are in the development stage so I am using my own database, but when we deploy the project we will need to change this to the production database URI which is a different database that is also hosted on MongoDB but is meant for production use and can handle more traffic and data than the development database. The MONGO_URI is stored in an environment variable for security reasons, so that we don't expose our database credentials in our code, and we can easily switch between different databases for development and production without changing the code.
  .then(() => {
    // what is the .then() method? is to handle the function above of all the info we have stored in the MONGO_URI and to log a message to the console if the connection is successful, and if there is an error connecting to the database, it will be caught by the .catch() method and log an error message to the console with the details of the error.
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

const watchlistSchema = new mongoose.Schema({
  // our object shape which is our database storing all the data which is all just strings
  title: String,
  year: String,
  imdbID: String,
  type: String,
  poster: String,
  genre: String,
  rating: { type: Number, default: null },
});

const WatchlistItem = mongoose.model("WatchlistItem", watchlistSchema); // here we declare the watchlist using the function above this comment you are seeing. This is the model that we will use to interact with the watchlist collection in our MongoDB database, allowing us to create, read, update, and delete watchlist items as needed for our application.

app.post("/api/watchlist", async (req, res) => {
  try {
    const existing = await WatchlistItem.findOne({ imdbID: req.body.imdbID });
    if (existing) {
      return res.status(409).json({ error: "Already in watchlist" });
    }
    const newItem = new WatchlistItem(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to add to watchlist" });
  }
});
app.patch("/api/watchlist/:id", async (req, res) => {
  // here we are requesting javascript to update (patch) the results by updating the id then throwing an error 500 meaning it has failed the update
  try {
    const rating = await WatchlistItem.findByIdAndUpdate(
      req.params.id,
      { $set: { rating: req.body.rating } },
      { new: true },
    );
    res.json(rating); // respond with the raitng schema
  } catch (err) {
    // throw an error if the rating is unavailable
    return res.status(500).json({ error: "Rating Unavailable" });
  }
});

app.get("/api/watchlist", async (req, res) => {
  try {
    const items = await WatchlistItem.find();
    res.json(items);
  } catch (err)
    {res.status(500).json({ error: "Failed to fetch watchlist" });
  }
});

app.delete("/api/watchlist/:id", async (req, res) => {
  // this is the route to handle the deletion of a watchlist item, it takes the id of the item to be deleted as a parameter in the URL, and then it uses the WatchlistItem model to find and delete the item from the database, if the item is not found it returns a 404 error, and if there is any other error during the deletion process it returns a 500 error with a message indicating that the deletion failed.
  try {
    const deleted = await WatchlistItem.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ message: "Removed" }); // response from the json data throwing an object with a message property that says "Removed" to indicate that the item was successfully removed from the watchlist.
  } catch (err) {
    res.status(500).json({ error: "Failed to remove item" });
  }
});

app.listen(PORT, () => {
  // this is our function for our server port to listen for incoming requests, and when the server starts successfully it will log a message to the console indicating that the server is running and on which port it is listening, this is useful for debugging and confirming that our server is up and running correctly.
  console.log(`Server is running on port ${PORT}`);
});
