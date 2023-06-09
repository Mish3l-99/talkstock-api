const express = require("express");

const router = express.Router();

// console.log(express.application.listen);

const limit = 12;

const Conversation = require("../models/conversation");
const User = require("../models/user");

// get conversation or set
router.post("/conv/:from/:to", async (req, res) => {
  const from = req.params.from;
  const to = req.params.to;

  try {
    const tryFind = await Conversation.find({
      participants: { $all: [from, to] },
    });
    if (tryFind.length > 0) {
      const convers = tryFind[0];
      const withee = convers.withs.filter((x) => x.user === to)[0];
      res.json({
        success: true,
        op: "found",
        data: { id: convers._id, withee },
      });
    } else {
      const convo = new Conversation({
        participants: [from, to],
        withs: [...req.body],
        // today
        lastMessageDate: new Date().toLocaleDateString(),
      });
      const withee = req.body.filter((x) => x.user === to)[0];
      try {
        const savedConvo = await convo.save();
        res.status(201).json({
          succss: true,
          op: "set",
          data: { id: savedConvo._id, withee },
        });
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//get conv for profile
router.get("/profile/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const tryFind = await Conversation.find({
      participants: { $all: [id] },
    });
    if (tryFind.length > 0) {
      const data = [];
      tryFind.map((conv) => {
        const convs = conv.withs.filter((wth) => wth.user !== id)[0];
        data.push({
          conv: conv._id,
          with: convs,
          lastMessageDate: conv.lastMessageDate,
        });
      });

      res.json({ success: true, data });
    } else {
      res.json({ success: true, data: [] });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
