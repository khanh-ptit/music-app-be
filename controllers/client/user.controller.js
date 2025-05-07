const User = require("../../models/user.model");
const md5 = require("md5");

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body; 

    const existUser = await User.findOne({ email: email, deleted: false });

    if (!existUser) {
      return res.status(404).json({
        code: 404,
        message: "Email không hợp lệ!"  
      });
    }

    if (md5(password) !== existUser.password) {
      return res.status(401).json({
        code: 401,
        message: "Mật khẩu không chính xác!" 
      });
    }

    return res.status(200).json({
      code: 200,
      message: "Đăng nhập thành công",
      token: existUser.tokenUser
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi đăng nhập!"
    });
  }
};
