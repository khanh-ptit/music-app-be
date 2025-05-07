const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/singer.controller");

router.get("/", controller.getSingerList);

router.get("/:singerId", controller.getSongBySinger);

module.exports = router;
