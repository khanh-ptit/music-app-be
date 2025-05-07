const Singer = require("../../models/singer.model");
const Song = require("../../models/song.model");

module.exports.getSingerList = async (req, res) => {
  try {
    const singers = await Singer.find({
      deleted: false,
    }).sort({
      position: "desc",
    });
    console.log(singers);
    res.json({
      singers,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy danh sách ca sĩ!",
    });
  }
};

module.exports.getSongBySinger = async (req, res) => {
  try {
    const singerId = req.params.singerId;
    const singerInfo = await Singer.findOne({ _id: singerId }).select(
      "-updatedBy"
    );
    const songs = await Song.find({
      singerId: singerId,
      status: "active",
      deleted: false,
    })
      .lean()
      .sort({
        position: "asc",
      })
      .select("-lyrics");
    for (const item of songs) {
      const singerId = item.singerId;
      const singerInfo = await Singer.findOne({ _id: singerId });
      if (singerInfo) {
        item.singerName = singerInfo.fullName;
      }
    }
    res.json({
      singerInfo,
      songs,
    });
  } catch {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy danh sách bài hát theo chủ đề!",
    });
  }
};
