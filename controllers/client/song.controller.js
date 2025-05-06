const Song = require("../../models/song.model");
const Singer = require("../../models/singer.model");

module.exports.getSongList = async (req, res) => {
  try {
    const songs = await Song.find({ deleted: false }).limit(10).lean();
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

    const songs = await Song.find(find).lean();
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

module.exports.getNextSong = async (req, res) => {
  try {
      const currentSongId = req.params.id;  // Lấy ID bài hát hiện tại từ params

      // Lấy bài hát hiện tại
      const currentSong = await Song.findById(currentSongId).lean();

      if (!currentSong) {
          return res.status(404).json({
              code: 404,
              message: "Bài hát không tồn tại",
          });
      }

      // Tìm bài hát tiếp theo dựa trên position + 1
      const nextSong = await Song.findOne({ position: currentSong.position + 1, deleted: false }).lean();

      if (!nextSong) {
          return res.status(404).json({
              code: 404,
              message: "Không tìm thấy bài hát tiếp theo",
          });
      }

      // Cập nhật thông tin của ca sĩ cho bài hát
      const singerInfo = await Singer.findById(nextSong.singerId);
      nextSong.singerName = singerInfo ? singerInfo.fullName : "Unknown";

      res.json({
          song: nextSong,
      });
  } catch (error) {
      console.log(error);
      res.status(500).json({
          code: 500,
          message: "Đã xảy ra lỗi khi lấy bài hát tiếp theo!",
      });
  }
};
