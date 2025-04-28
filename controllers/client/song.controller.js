const Song = require("../../models/song.model");
const Singer = require("../../models/singer.model");

module.exports.getSongList = async (req, res) => {
  try {
    const songs = await Song.find({ deleted: false })
      .limit(10)
      .select("-lyrics")
      .lean();
    for (const item of songs) {
      const singerId = item.singerId;
      const singerInfo = await Singer.findOne({ _id: singerId });
      if (singerInfo) {
        item.singerName = singerInfo.fullName;
      }
    }
    res.json({ songs });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy danh sách bài hát!",
    });
  }
};

module.exports.getSongRanking = async (req, res) => {
  try {
    const songs = await Song.find({ deleted: false })
      .limit(5)
      .select("-lyrics -createdBy -updatedBy -description")
      .sort({
        listen: "desc",
      })
      .lean();
    for (const item of songs) {
      const singerId = item.singerId;
      const singerInfo = await Singer.findOne({ _id: singerId });
      if (singerInfo) {
        item.singerName = singerInfo.fullName;
      }
    }
    // console.log(songs);
    res.json({ songs });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy danh sách bài hát!",
    });
  }
};
