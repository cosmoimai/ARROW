const express = require("express");
const router = express.Router();
const { ensureAuth, ensureGuest } = require("../middleware/auth");
const User = require("../models/User");
var spawn = require("child_process").spawn;
const http = require("http");
const io = require("../app.js");
const superagent = require("superagent");
const mongoose = require("mongoose");
const Result = require("../models/Result");

router.get("/patient", (req, res) => {
  let all = User.find({role : "patient"})
  .lean()
  .then((users) => {
    res.render('user', {role: "Patients", users: users.reverse()})
  })
  .catch((error) => res.json({ error: error.message }));
});

router.get("/:gid", async (req, res) => {
  let user = await User.findOne({ googleId: req.params.gid });
  let allResults = await Result.find(
    { googleId: req.params.gid },
    (err, results) => {
      res.send({ profile: user, results: results });
    }
  );
});

module.exports = router;
