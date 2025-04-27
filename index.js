const express = require("express");
const database = require("./config/database");
require("dotenv").config();
database.connect();
const app = express();
const port = process.env.PORT || 3000;

const routeClient = require("./routes/client/index.route");

routeClient(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
