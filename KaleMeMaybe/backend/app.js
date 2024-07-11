// Setup Express
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

//Set up cross-domain access
const cors = require("cors");
app.use(cors());

// setup dotenv
require("dotenv").config();

// Setup body-parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Setup cookie-parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Setup bcrypt
const bcrypt = require("bcrypt");

// Make the "public" folder available statically
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

// Setup mysql2 and initialize connection
const pool = require("./data/database.js")

setInterval(async () => {
  try {
      const connection = await pool.getConnection();
      await connection.execute("SELECT 1");
      connection.release();
      console.log("Heartbeat query successful");
  } catch (err) {
      console.error("Heartbeat query error:", err);
  }
}, 7200000);

// Setup routes
app.use("/api", require("./routes/users.js"));
app.use("/api", require("./routes/recipes.js"));
app.use("/api", require("./routes/browsing-histories.js"));
app.use("/api", require("./routes/ingredients.js"));
app.use("/api", require("./routes/scores.js"));
app.use("/api", require("./routes/search-histories.js"));
app.use("/api/collection", require("./routes/collections.js"));
app.use("/api/favorites", require("./routes/favorites.js"));
app.use("/api/discover", require("./routes/discover.js"));

if (require.main === module) {
  app.listen(port, function () {
    console.log(`App listening on port ${port}!`);
  });
}

module.exports = app;
