const express = require("express");
const router = express.Router();
const {
  ensureAuth,
  ensureGuest,
  ensureDoctor,
  ensurePatient,
} = require("../middleware/auth");
const User = require("../models/User");
var spawn = require("child_process").spawn;
const http = require("http");
const io = require("../app.js");
const superagent = require("superagent");
const mongoose = require("mongoose");
const Result = require("../models/Result");
const Prescription = require("../models/Prescription");

router.get("/patient", ensureDoctor, (req, res) => {
  try {
    let all = User.find({ role: "patient" })
      .lean()
      .then((users) => {
        var loggedInProfile = {
          googleId: req.user.googleId,
          displayName: req.user.displayName,
          role: req.user.role,
          email: req.user.email,
          image: req.user.image,
        }
        res.render("user", {
          layout: 'two.hbs',
          profile: loggedInProfile,
          role: "Patients",
          users: users.reverse(),
          auth: req.isAuthenticated(),
          doctor: req.isAuthenticated() && req.user.role === "doctor",
          patient: req.isAuthenticated() && req.user.role === "patient",
          notDoctor: !req.isAuthenticated() || req.user.role === "patient",
        });
      })
      .catch((error) => res.json({ error: error.message }));
  } catch (error) {
    res.json({ error: error.message });
  }
});

router.get("/doctor", ensurePatient, (req, res) => {
  try {
    let all = User.find({ role: "doctor" })
      .lean()
      .then((users) => {
        var loggedInProfile = {
          googleId: req.user.googleId,
          displayName: req.user.displayName,
          role: req.user.role,
          email: req.user.email,
          image: req.user.image,
        }
        res.render("user", {
          layout: 'two.hbs',
          profile: loggedInProfile,
          role: "Doctors",
          users: users.reverse(),
          auth: req.isAuthenticated(),
          doctor: req.isAuthenticated() && req.user.role === "doctor",
          patient: req.isAuthenticated() && req.user.role === "patient",
          notDoctor: !req.isAuthenticated() || req.user.role === "patient",
        });
      })
      .catch((error) => res.json({ error: error.message }));
  } catch (error) {
    res.json({ error: error.message });
  }
});

router.get("/:gid", ensureAuth, async (req, res) => {
  try {
    let user = await User.findOne({ googleId: req.params.gid })
      .lean()
      .then(async (user) => {
        if (user.role === "patient" && req.user.role === "doctor") {
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
                auth: req.isAuthenticated(),
                doctor: req.isAuthenticated() && req.user.role === "doctor",
                patient: req.isAuthenticated() && req.user.role === "patient",
                notDoctor:
                  !req.isAuthenticated() || req.user.role === "patient",
              });
            })
            .catch((error) => res.json({ error: error.message }));
        } else if (user.role === "doctor" && req.user.role === "patient") {
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
                auth: req.isAuthenticated(),
                doctor: req.isAuthenticated() && req.user.role === "doctor",
                patient: req.isAuthenticated() && req.user.role === "patient",
                notDoctor:
                  !req.isAuthenticated() || req.user.role === "patient",
              });
            })
            .catch((error) => res.json({ error: error.message }));
        } else {
          res.redirect("/dashboard");
        }
      })
      .catch((error) => res.json({ error: error.message }));
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = router;