const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/song.controller");

router.get("/", controller.getSongList);

router.get("/ranking", controller.getSongRanking);

router.patch("/like/:id", controller.likeSong);

router.get("/search/:slug", controller.getSongBySlug);

router.get("/detail/:slug", controller.getSongDetail);

router.get("/next/:id", controller.getNextSong);

router.get("/prev/:id", controller.getPreviousSong);

router.patch("/update-listen/:songId", controller.updateListen);

module.exports = router;
