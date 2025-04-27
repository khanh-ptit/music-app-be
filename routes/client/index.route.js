const songRoutes = require("./song.route");

module.exports = (app) => {
  app.use("/songs", songRoutes);
};
