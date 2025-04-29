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

module.exports.getSongBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;

    const regex = new RegExp(slug, "i");

    let find = {
      slug: regex,
      status: "active",
      deleted: false,
    };

    const songs = await Song.find(find).select("-lyrics").lean();
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

module.exports.getSongDetail = async (req, res) => {
  try {
    const slug = req.params.slug;
    const song = await Song.findOne({
      status: "active",
      deleted: false,
      slug: slug,
    })
      .select("-updatedBy")
      .lean();
    const singer = await Singer.findOne({ _id: song.singerId });
    song.singerName = singer.fullName;
    res.json({ song });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy chi tiết bài hát!",
    });
  }
};
