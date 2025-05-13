const Song = require("../../models/song.model");
const Singer = require("../../models/singer.model");
const User = require("../../models/user.model");
const FavoriteSong = require("../../models/favorite-song.model");

module.exports.getSongList = async (req, res) => {
  try {
    const songs = await Song.find({ deleted: false })
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

module.exports.isLike = async (req, res) => {
  try {
    const songId = req.params.id;
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: "No token provided",
      });
    }

    // Find user by token
    const user = await User.findOne({ tokenUser: token, deleted: false });
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "User not found",
      });
    }

    // Find the song by ID
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        code: 404,
        message: "Song not found",
      });
    }

    // Check if the song is liked by the user
    const isLiked = song.like.includes(user._id); // Check if user ID is in the like array

    res.status(200).json({
      code: 200,
      message: isLiked ? "Bài hát đã được thích" : "Bài hát chưa được thích",
      isLiked: isLiked,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: "An error occurred while checking like status",
    });
  }
};

module.exports.likeSong = async (req, res) => {
  try {
    const songId = req.params.id;
    const tokenUser = req.headers["authorization"]; // Lấy token từ header

    if (!tokenUser) {
      return res.status(401).json({
        code: 401,
        message: "No token provided",
      });
    }

    // Tìm người dùng theo token
    const user = await User.findOne({ tokenUser: tokenUser, deleted: false });
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "Người dùng không tồn tại!",
      });
    }

    const userId = user._id.toString();

    // Tìm bài hát theo songId
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        code: 404,
        message: "Không tồn tại bài hát!",
      });
    }

    // Kiểm tra xem người dùng đã like bài hát chưa
    const isLiked = song.like.includes(userId);

    if (isLiked) {
      // Nếu đã like, thì bỏ like (xóa userId khỏi mảng likes)
      song.like = song.like.filter((id) => id !== userId);
    } else {
      // Nếu chưa like, thì thêm userId vào mảng likes
      song.like.push(userId);
    }

    await song.save();

    return res.status(200).json({
      code: 200,
      message: isLiked ? "Đã bỏ thích bài hát!" : "Đã thích bài hát",
      likesCount: song.like.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "An error occurred while liking the song",
    });
  }
};
module.exports.favoriteSong = async (req, res) => {
  try {
    const songId = req.params.id; // Lấy songId từ tham số URL
    const tokenUser = req.headers["authorization"]; // Lấy token từ header

    if (!tokenUser) {
      return res.status(401).json({
        code: 401,
        message: "No token provided",
      });
    }

    // Tìm người dùng theo token
    const user = await User.findOne({ tokenUser: tokenUser, deleted: false });
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "Người dùng không tồn tại!",
      });
    }

    const userId = user._id.toString();

    // Kiểm tra xem bài hát đã tồn tại trong danh sách yêu thích của người dùng chưa
    const existFavoriteSong = await FavoriteSong.findOne({
      userId: userId,
      songId: songId,
    });

    if (existFavoriteSong) {
      // Nếu bài hát đã có trong danh sách yêu thích, tiến hành bỏ yêu thích
      await FavoriteSong.deleteOne({ _id: existFavoriteSong._id.toString() });
      return res.status(200).json({
        code: 200,
        message: "Đã bỏ yêu thích bài hát!",
      });
    } else {
      // Nếu bài hát chưa có trong danh sách yêu thích, tiến hành thêm vào
      const newFavoriteSong = new FavoriteSong({
        userId: userId,
        songId: songId,
      });
      await newFavoriteSong.save();

      return res.status(200).json({
        code: 200,
        message: "Đã yêu thích bài hát!",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi thích bài hát",
    });
  }
};

module.exports.isFavorite = async (req, res) => {
  try {
    const songId = req.params.id; // Lấy songId từ URL params
    const token = req.headers["authorization"]; // Lấy token từ header (Bearer token)

    if (!token) {
      return res.status(401).json({
        code: 401,
        message: "No token provided",
      });
    }

    // Tìm người dùng theo token
    const user = await User.findOne({ tokenUser: token, deleted: false });
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "User not found",
      });
    }

    // Kiểm tra xem bài hát có nằm trong danh sách yêu thích của người dùng không
    const favoriteSong = await FavoriteSong.findOne({
      userId: user._id.toString(),
      songId: songId,
    });

    // Nếu có trong danh sách yêu thích thì isFavorite = true, nếu không thì false
    const isFavorite = favoriteSong ? true : false;

    return res.status(200).json({
      code: 200,
      message: isFavorite
        ? "Bài hát đã được yêu thích"
        : "Bài hát chưa được yêu thích",
      isFavorite: isFavorite, // Trả về trạng thái yêu thích của bài hát
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: "An error occurred while checking favorite status",
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
      deleted: false, // Kiểm tra bài hát chưa bị xóa
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
