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
const Prescription = require("../models/Prescription");

router.get("/patient", (req, res) => {
  let all = User.find({ role: "patient" })
    .lean()
    .then((users) => {
      res.render("user", { role: "Patients", users: users.reverse() });
    })
    .catch((error) => res.json({ error: error.message }));
});

router.get("/doctor", (req, res) => {
  let all = User.find({ role: "doctor" })
    .lean()
    .then((users) => {
      res.render("user", { role: "Doctors", users: users.reverse() });
    })
    .catch((error) => res.json({ error: error.message }));
});

router.get("/:gid", async (req, res) => {
  let user = await User.findOne({ googleId: req.params.gid })
    .lean()
    .then(async (user) => {
      if (user.role === "patient") {
        let allResults = await Result.find({ googleId: req.params.gid })
          .lean()
          .then((results) => {
            let suser = {
              displayName: user.displayName,
              image: user.image,
              googleId: user.googleId,
              role: user.role,
              email: user.email,
            };
            var options = {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
            };

            for (var i = 0; i < results.length; i++) {
              results[i] = {
                resultId: results[i]._id,
                maindisease: results[i].predictionMain[0],
                mainpercentage: results[i].predictionMain[1],
                createdAt: results[i].createdAt.toLocaleDateString(
                  "en-US",
                  options
                ),
              };
            }

            console.log(results);

            res.render("dashboard", {
              profile: suser,
              results: results.reverse(),
            });
          })
          .catch((error) => res.json({ error: error.message }));
      } else {
        let allPres = await Prescription.find({ googleId: req.params.gid })
          .lean()
          .then((prescriptions) => {
            let suser = {
              displayName: user.displayName,
              image: user.image,
              googleId: user.googleId,
              role: user.role,
              email: user.email,
            };
            res.render("doctor", {
              profile: suser,
              prescriptions: prescriptions.reverse(),
            });
          })
          .catch((error) => res.json({ error: error.message }));
      }
    });
});

module.exports = router;
