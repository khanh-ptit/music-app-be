const User = require("../../models/user.model");
const Song = require("../../models/song.model");
const FavoriteSong = require("../../models/favorite-song.model");
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
    const tokenUser = req.headers["authorization"].split(" ")[1];

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
    });

    const songIds = songs.map(song => song.songId);
    console.log("Song IDs: ", songIds);

    const songInfoPromises = songIds.map(songId => {
      return Song.findById(songId);  // Assuming Song is a model for songs in your DB
    });

    const songInfos = await Promise.all(songInfoPromises);
    console.log("Song Infos: ", songInfos);

    return res.status(200).json({
      code: 200,
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      favoriteSongs: songInfos,  // Sending the song details in response
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "An error occurred while fetching user profile",
    });
  }
};
