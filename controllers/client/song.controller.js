const Song = require("../../models/song.model");

module.exports.getSongList = async (req, res) => {
  const songs = await Song.find({ deleted: false }).limit(10).select("-lyrics");
  // console.log(songs);
  res.json({ songs });
};
