require("dotenv").config();

const express = require("express");

var cors = require("cors");
const app = express();

// This is to enable CORS for all origins
app.use(cors());

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

// // defining a content route and using it
// const contentsRouter = require("./routes/contents");
// app.use("/content", contentsRouter);

app.listen(3000, () => console.log("server started!"));
