const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/user.controller");

router.post("/login", controller.login);

router.get("/profile", controller.getUserProfile);

router.get("/favorite-songs", controller.getFavoriteSong);

module.exports = router;
