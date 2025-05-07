const mongoose = require("mongoose");
const generateHelper = require("../helpers/generate.js");

const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  tokenUser: {
    type: String,
    default: () => generateHelper.generateRandomString(30),
  },
  status: {
    type: String,
  },
  avatar: {
    type: String,
    default:
      "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg",
  },
  phone: String,
  address: String,
  deleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: [
    {
      accountId: String,
      updatedAt: Date,
    },
  ],
  deletedBy: {
    accountId: String,
    deletedAt: Date,
  },
});

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
