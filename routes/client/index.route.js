const songRoutes = require("./song.route");
const singerRoutes = require("./singer.route");
const topicRoutes = require("./topic.route");

module.exports = (app) => {
  app.use("/songs", songRoutes);
  app.use("/singers", singerRoutes);
  app.use("/topics", topicRoutes);
};
