const mongoose = require("mongoose")
const slug = require("mongoose-slug-updater")
mongoose.plugin(slug);

const songSchema = new mongoose.Schema({
  title: String,
  avatar: String,
  singerId: String,
  description: String,
  topicId: String,
  like: {
    type: Array,
    default: [],
  },
  position: Number,
  lyrics: String,
  audio: String,
  status: String,
  slug: {
    type: String,
    slug: "title",
    unique: true,
  },
  listen: {
    type: Number,
    default: 0,
  },
  deleted: {
    type: Boolean,
    default: false,
  }
});

const Song = mongoose.model("Song", songSchema, "songs");

module.exports = Song;
