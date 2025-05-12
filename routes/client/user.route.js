const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/user.controller");

router.post("/login", controller.login);

router.get("/profile", controller.getUserProfile)

module.exports = router;
