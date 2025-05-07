const express = require("express");
const database = require("./config/database");
require("dotenv").config();
database.connect();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Cho phép nhận dữ liệu JSON trong body của request
app.use(express.urlencoded({ extended: true })); 

// Import routes
const routeClient = require("./routes/client/index.route");

// Kết nối các route vào ứng dụng
routeClient(app);

// Start server
app.listen(port, "0.0.0.0", () => {
  console.log(`Example app listening on port ${port}`);
});
