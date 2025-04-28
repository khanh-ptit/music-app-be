const Singer = require("../../models/singer.model")

module.exports.getSingerList = async (req, res) => {
  try {
    const singers = await Singer.find({
      deleted: false
    }).sort({
      position: "desc"
    })
    console.log(singers)
    res.json({
      singers
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy danh sách ca sĩ!"
    })
  }
}
