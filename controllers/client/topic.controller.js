const Topic = require("../../models/topic.model");
const Song = require("../../models/song.model");
const Singer = require("../../models/singer.model")

module.exports.getTopicList = async (req, res) => {
  try {
    const topics = await Topic.find({ deleted: false }).select(
      "-updatedBy -createdBy"
    );
    res.json({ topics });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy danh sách ",
    });
  }
};

module.exports.getSongByTopic = async (req, res) => {
  try {
    const topicId = req.params.topicId;
    const topicInfo = await Topic.findOne({ _id: topicId }).select(
      "-updatedBy"
    );
    const songs = await Song.find({
      topicId: topicId,
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
      topicInfo,
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
