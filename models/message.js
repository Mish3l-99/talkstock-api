const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  room: String,
  createdAt: Number,
  from: String,
  image: String,
  text: String,
  user: String,
});

module.exports = mongoose.model("message", messageSchema);
