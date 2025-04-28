const Song = require("../../models/song.model");

module.exports.getSongList = async (req, res) => {
  try {
    const songs = await Song.find({ deleted: false })
      .limit(10)
      .select("-lyrics");
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

module.exports.getSongRanking = async (req, res) => {
  try {
    const songs = await Song.find({ deleted: false })
      .limit(10)
      .select("-lyrics -createdBy -updatedBy")
      .sort({
        listen: "desc",
      });
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
