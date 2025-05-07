const Song = require("../../models/song.model");
const Singer = require("../../models/singer.model");

module.exports.getSongList = async (req, res) => {
  try {
    const songs = await Song.find({ deleted: false })
      .limit(10)
      .sort({ position: "asc" })
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
    const currentSongId = req.params.id; // Lấy ID bài hát hiện tại từ params

    // Lấy bài hát hiện tại
    const currentSong = await Song.findById(currentSongId).lean();

    if (!currentSong) {
      return res.status(404).json({
        code: 404,
        message: "Bài hát không tồn tại",
      });
    }

    // Tìm bài hát có vị trí lớn nhất (max position)
    const maxPositionSong = await Song.findOne().sort({ position: -1 }).lean();

    // Nếu bài hát hiện tại ở vị trí max, chuyển về bài hát có position = 1
    let nextSong;
    if (currentSong.position === maxPositionSong.position) {
      nextSong = await Song.findOne({ position: 1, deleted: false }).lean();
    } else {
      // Nếu không phải bài hát max position, tìm bài hát tiếp theo
      nextSong = await Song.findOne({
        position: currentSong.position + 1,
        deleted: false,
      }).lean();
    }

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

module.exports.getPreviousSong = async (req, res) => {
  try {
    const currentSongId = req.params.id; // Lấy ID bài hát hiện tại từ params

    // Lấy bài hát hiện tại
    const currentSong = await Song.findById(currentSongId).lean();

    if (!currentSong) {
      return res.status(404).json({
        code: 404,
        message: "Bài hát không tồn tại",
      });
    }

    // Tìm bài hát có vị trí lớn nhất (max position)
    const maxPositionSong = await Song.findOne().sort({ position: -1 }).lean();

    // Nếu bài hát hiện tại ở vị trí 1, chuyển về bài hát có vị trí max
    let previousSong;
    if (currentSong.position === 1) {
      previousSong = await Song.findOne({
        position: maxPositionSong.position,
        deleted: false,
      }).lean();
    } else {
      // Nếu không phải bài hát đầu tiên, tìm bài hát trước đó (position - 1)
      previousSong = await Song.findOne({
        position: currentSong.position - 1,
        deleted: false,
      }).lean();
    }

    if (!previousSong) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy bài hát trước đó",
      });
    }

    // Cập nhật thông tin của ca sĩ cho bài hát
    const singerInfo = await Singer.findById(previousSong.singerId);
    previousSong.singerName = singerInfo ? singerInfo.fullName : "Unknown";

    res.json({
      song: previousSong,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy bài hát trước đó!",
    });
  }
};

module.exports.updateListen = async (req, res) => {
  try {
    const songId = req.params.songId; 

    // Tìm bài hát theo songId
    const song = await Song.findOne({
      _id: songId,
      status: "active", // Kiểm tra trạng thái của bài hát
      deleted: false,   // Kiểm tra bài hát chưa bị xóa
    });

    // Nếu không tìm thấy bài hát
    if (!song) {
      return res.status(404).json({
        code: 404,
        message: "Bài hát không tồn tại hoặc đã bị xóa!",
      });
    }

    // Cập nhật lượt nghe, cộng thêm 1 vào trường 'listen'
    song.listen += 1;

    // Lưu lại bài hát với lượt nghe đã được cập nhật
    await song.save();

    // Trả về phản hồi thành công
    res.status(200).json({
      code: 200,
      message: "Lượt nghe đã được cập nhật thành công!",
      data: song,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi cập nhật lượt nghe!",
    });
  }
};
