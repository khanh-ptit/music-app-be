const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/user.controller");

router.post("/login", controller.login);

router.post("/register", controller.register);

router.get("/profile", controller.getUserProfile);

router.get("/favorite-songs", controller.getFavoriteSong);

router.post("/forgot-password", controller.forgotPassword)

module.exports = router;
