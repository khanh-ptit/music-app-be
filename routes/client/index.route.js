const songRoutes = require("./song.route");
const singerRoutes = require("./singer.route");

module.exports = (app) => {
  app.use("/songs", songRoutes);
  app.use("/singers", singerRoutes);
};
