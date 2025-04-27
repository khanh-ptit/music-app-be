const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/song.controller");

router.get("/", controller.getSongList);

module.exports = router;
