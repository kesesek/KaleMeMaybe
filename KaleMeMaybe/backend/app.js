// Setup Express
const express = require("express");

const app = express();
const port = 3000;

//Set up cross-domain access
const cors = require('cors');
app.use(cors());

// setup dotenv
require("dotenv").config();

// Setup body-parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Setup cookie-parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Make the "public" folder available statically
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

// Setup routes
app.use("/api", require("./routes/users.js"));
app.use("/api", require("./routes/recipes.js"));
app.use("/api", require("./routes/histories.js"));
app.use("/api", require("./routes/collections.js"));
app.use("/api", require("./routes/ingredients.js"));

app.use("/api/favorites", require("./routes/favorites.js"));

// Start the server running.
app.listen(port, function () {
  console.log(`App listening on port ${port}!`);
});

app.get('/', (req, res) => {
  res.send('here is localhost 3000');
});

// use discover router
app.use('/discover', require('./routes/discover.js'));