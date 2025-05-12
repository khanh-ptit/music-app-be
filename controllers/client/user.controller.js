const User = require("../../models/user.model");
const Song = require("../../models/song.model");
const FavoriteSong = require("../../models/favorite-song.model");
const Singer = require("../../models/singer.model");
const md5 = require("md5");

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existUser = await User.findOne({ email: email, deleted: false });

    if (!existUser) {
      return res.status(404).json({
        code: 404,
        message: "Email không hợp lệ!",
      });
    }

    if (md5(password) !== existUser.password) {
      return res.status(401).json({
        code: 401,
        message: "Mật khẩu không chính xác!",
      });
    }

    return res.status(200).json({
      code: 200,
      message: "Đăng nhập thành công",
      token: existUser.tokenUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi đăng nhập!",
    });
  }
};

module.exports.register = async (req, res) => {
  try {
    const { fullName, email, password, address, phone } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email: email, deleted: false });
    if (existingUser) {
      return res.status(400).json({
        code: 400,
        message: "Email đã tồn tại!",
      });
    }

    // Mã hóa password trước khi lưu vào cơ sở dữ liệu
    const hashedPassword = md5(password);

    // Tạo mới người dùng
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      address,
      phone,
    });

    await newUser.save();

    return res.status(201).json({
      code: 201,
      message: "Đăng ký thành công!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi đăng ký!",
    });
  }
};

module.exports.getUserProfile = async (req, res) => {
  try {
    const tokenUser = req.headers["authorization"];

    if (!tokenUser) {
      return res.status(401).json({
        code: 401,
        message: "No token provided",
      });
    }

    console.log(tokenUser);

    const user = await User.findOne({ tokenUser: tokenUser, deleted: false });

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "User not found",
      });
    }

    return res.status(200).json({
      code: 200,
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "An error occurred while fetching user profile",
    });
  }
};

module.exports.getFavoriteSong = async (req, res) => {
  try {
    const tokenUser = req.headers["authorization"];

    if (!tokenUser) {
      return res.status(401).json({
        code: 401,
        message: "No token provided",
      });
    }

    console.log(tokenUser);

    const user = await User.findOne({ tokenUser: tokenUser, deleted: false });

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "User not found",
      });
    }

    const userId = user._id.toString();
    console.log(userId);

    // Fetching favorite songs
    const songs = await FavoriteSong.find({
      userId: userId,
    }).lean();

    const songIds = songs.map((song) => song.songId);
    // console.log("Song IDs: ", songIds);

    const songInfoPromises = songIds.map((songId) => {
      return Song.findById(songId); // Assuming Song is a model for songs in your DB
    });

    const songInfos = await Promise.all(
      songIds.map(async (songId) => {
        const song = await Song.findById(songId).lean();
        if (!song) return null;

        const singer = await Singer.findById(song.singerId).lean();
        song.singerName = singer ? singer.fullName : "Unknown";

        return song;
      })
    );

    return res.status(200).json({
      code: 200,
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      favoriteSongs: songInfos, // Sending the song details in response
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "An error occurred while fetching user profile",
    });
  }
};
