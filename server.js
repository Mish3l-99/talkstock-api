require("dotenv").config();

const OriginAllowed = process.env.ORIGIN_ALLOWED;

var express = require("express");
var cors = require("cors");
var app = express();
// This is to enable CORS for one origin
app.use(cors());

var http = require("http").createServer(app);
// http.use(cors({ origin: OriginAllowed }));

var io = require("socket.io")(http, {
  cors: {
    origin: OriginAllowed,
    methods: ["GET", "POST"],
  },
});
//

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL);

const db = mongoose.connection;

db.on("error", (error) => console.log(error));
db.once("open", () => console.log("db connected!"));

// allow app to accept json in req body
app.use(express.json());

// defining a users route and using it
const usersRoute = require("./routes/users");
app.use("/users", usersRoute);
app.use("/profile", express.static("images/profiles"));

// defining a votings route and using it
const votingsRoute = require("./routes/votings");
app.use("/votings", votingsRoute);

// defining a messages route and using it
const messagesRoute = require("./routes/messages");
app.use("/messages", messagesRoute);

// socket stuff
const limit = 12;
const Message = require("./models/message");

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

// // defining a content route and using it
// const contentsRouter = require("./routes/contents");
// app.use("/content", contentsRouter);

http.listen(3000, () => console.log("server started!"));
