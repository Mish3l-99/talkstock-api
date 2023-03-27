const express = require("express");

const router = express.Router();

const OriginAllowed = process.env;

// messages limit in a chat
const limit = 12;

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(router);

const io = new Server(server, {
  cors: {
    origin: OriginAllowed,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  //   console.log(`User Connected: ${socket.id}`);

  socket.on("join_chat", async (data) => {
    socket.join(data);
  });

  socket.on("join_room", async (data) => {
    socket.join(data);
    let messages;
    try {
      messages = await Message.find({ room: data })
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      console.log(error);
    }

    io.to(data).emit("send_stored", messages.reverse());
    // console.log("joined ", data);
  });

  socket.on("send_message", async (data) => {
    io.to(data.room).emit("receive_message", data);
    await storeMessage(data);
  });
});

server.listen(3001, () => console.log("socket server started!"));

const Message = require("../models/message");

const storeMessage = async (data) => {
  // test env
  const MssgsNum = await Message.find({ room: data.room }).countDocuments();
  if (MssgsNum <= 100) {
    const mssg = new Message(data);
    try {
      await mssg.save();
    } catch (error) {
      console.log(error);
    }
  }
  //   //   production;
  //   try {
  //     await Message.findOneAndReplace({ room: data.room }, data, {
  //       sort: { createdAt: 1 },
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
};

// get chat
router.get("/:room", async (req, res) => {
  const room = req.params.room;
  const MssgsNum = await Message.find({ room }).countDocuments();

  //   if (MssgsNum > limit) {
  //   }
  try {
    const messages = await Message.find({ room })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json({ success: true, MssgsNum, data: messages.reverse() });
  } catch (error) {
    res.status(500).json({ message: error.message });
    // console.log(error);
  }
});

// send one
router.post("/send", async (req, res) => {
  const messageBody = req.body;
  const message = new Message(messageBody);

  try {
    await message.save();
    res.status(201).json({ succss: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }

  // if(Message.)
});

module.exports = router;
