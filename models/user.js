const mongoose = require("mongoose");

const mssgSchema = new mongoose.Schema({
  createdAt: Number,
  text: String,
  mine: Boolean,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  image: String,
  username: String,
  lv_djia: Number,
  lv_nas: Number,
  lv_sp: Number,
  lv_nashun: Number,
  lv_nyse: Number,
  chats: [
    {
      with: String,
      messages: [mssgSchema],
    },
  ],
});

module.exports = mongoose.model("user", userSchema);
