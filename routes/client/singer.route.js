const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/singer.controller");

router.get("/", controller.getSingerList);

module.exports = router;
