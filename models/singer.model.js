const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const singerSchema = new mongoose.Schema({
  fullName: String,
  avatar: String,
  status: String,
  description: String,
  realName: String,
  birthYear: Number,
  nationality: String,
  hometown: String,
  slug: {
    type: String,
    slug: "fullName",
    unique: true,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  position: Number,
  deletedAt: Date,
  createdBy: {
    accountId: String,
    createdAt: Date,
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

const Singer = mongoose.model("Singer", singerSchema, "singers");

module.exports = Singer;
