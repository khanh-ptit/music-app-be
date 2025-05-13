const User = require("../../models/user.model");
const Song = require("../../models/song.model");
const FavoriteSong = require("../../models/favorite-song.model");
const Singer = require("../../models/singer.model");
const ForgotPassword = require("../../models/forgot-password.model");
const md5 = require("md5");
const sendMailHelper = require("../../helpers/sendMail");
const generateHelper = require("../../helpers/generate");

module.exports.forgotPassword = async (req, res) => {
  const email = req.body.email;
  const existEmail = await User.findOne({
    email: email,
    deleted: false,
  });
  if (!existEmail) {
    return res.status(404).json({
      code: 400,
      message: "Email không tồn tại không hệ thống!",
    });
  }

  const otp = generateHelper.generateRandomNumber(6);
  const objectForgotPassword = {
    email: email,
    otp: otp,
    expireAt: new Date(Date.now() + 180 * 1000),
  };
  const forgotPassword = new ForgotPassword(objectForgotPassword);
  console.log(objectForgotPassword);
  await forgotPassword.save();

  // Gửi OTP
  const subject = `Mã xác thực OTP đặt lại mật khẩu`;
  const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #6200EE; color: white; padding: 20px; text-align: center; font-size: 22px; font-weight: bold;">
                Xác Thực OTP
            </div>
            <div style="padding: 20px; line-height: 1.6;">
                <p style="font-size: 16px; color: #333;">Xin chào,</p>
                <p style="font-size: 16px; color: #333;">Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản của mình. Dưới đây là mã OTP để xác thực yêu cầu:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 28px; font-weight: bold; color: #6200EE; background-color: #FFF3E0; padding: 15px 25px; border: 2px dashed #6200EE; border-radius: 8px;">
                        ${otp}
                    </span>
                </div>
                <p style="font-size: 14px; color: #555;">
                    <b>Lưu ý:</b> Mã OTP này chỉ có hiệu lực trong vòng <b>3 phút</b>. Không chia sẻ mã này với bất kỳ ai để đảm bảo an toàn tài khoản.
                </p>
                <p style="font-size: 14px; color: #555;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi để được hỗ trợ.</p>
                <p style="font-size: 14px; color: #555;">Trân trọng,<br><span style="color: #6200EE; font-weight: bold;">MusicApp - Free To Everyone</span></p>
            </div>
            <div style="background-color: #FFE0B2; text-align: center; padding: 15px; font-size: 12px; color: #888;">
                Email này được gửi từ hệ thống của MusicApp. Nếu không phải bạn thực hiện yêu cầu, vui lòng liên hệ ngay với chúng tôi.
            </div>
        </div>
    `;

  sendMailHelper.sendMail(email, subject, html);

  res.status(200).json({
    code: 200,
    message: "OTP đã được gửi về email của bạn",
  });
};

module.exports.otpPassword = async (req, res) => {
  const otp = req.body.otp;
  const record = await ForgotPassword.findOne({
    email: req.body.email,
    otp: otp,
  });

  if (!record) {
    return res.status(400).json({
      code: 400,
      message: "OTP không hợp lệ",
    });
  }

  const user = await User.findOne({
    email: req.body.email,
  });

  res.status(200).json({
    code: 200,
    message: "Xác nhận OTP thành công!",
    token: user.tokenUser,
  });
};

module.exports.resetPassword = async (req, res) => {
  const tokenUser = req.headers["authorization"];

  if (!tokenUser) {
    return res.status(401).json({
      code: 401,
      message: "Vui lòng xác thực",
    });
  }
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if (password != confirmPassword) {
    return res.status(400).json({
      code: 400,
      message: "Mật khẩu không trùng khớp",
    });
  }

  const user = await User.findOne({
    tokenUser: tokenUser,
  });
  // console.log(user.password, md5(password))
  if (user.password == md5(password)) {
    return res.status(400).json({
      code: 400,
      message: "Mật khẩu mới không được trùng với mật khẩu cũ!",
    });
  }

  await User.updateOne(
    {
      tokenUser: tokenUser,
    },
    {
      password: md5(password),
    }
  );

  res.status(200).json({
    code: 200,
    message: "Cập nhật mật khẩu thành công!",
  });
};

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
