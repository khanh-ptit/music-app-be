const Topic = require("../../models/topic.model");

module.exports.getTopicList = async (req, res) => {
  try {
    const topics = await Topic.find({ deleted: false }).select("-updatedBy -createdBy");
    res.json({ topics });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy danh sách ",
    });
  }
};
