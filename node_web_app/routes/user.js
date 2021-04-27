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
        res.set('page', 'user');
        res.set('role', 'doctor');
        res.render("user", {
          profile: loggedInProfile,
          layout: 'two.hbs',
          role: "patients",
          users: users.reverse(),
          auth: req.isAuthenticated(),
          doctor: req.isAuthenticated() && req.user.role === "doctor",
          patient: req.isAuthenticated() && req.user.role === "patient",
          notDoctor: !req.isAuthenticated() || req.user.role === "patient",
        });
      })
      .catch((error) => res.json({ error: error.message }));
  } catch (error) {
    res.render("error", {
      layout: 'two.hbs',
      'message': error.message,
      auth: req.isAuthenticated(),
            doctor: req.isAuthenticated() && req.user.role === "doctor",
            patient: req.isAuthenticated() && req.user.role === "patient",
            notDoctor: !req.isAuthenticated() || req.user.role === "patient",
    })
    // res.json({ error: error.message });
  }
});

router.get("/doctor", ensureAuth, (req, res) => {
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
        res.set('page', 'user');
        res.set('role', req.user.role);
        res.render("user", {
          profile: loggedInProfile,
          layout: 'two.hbs',
          role: "doctors",
          users: users.reverse(),
          auth: req.isAuthenticated(),
          doctor: req.isAuthenticated() && req.user.role === "doctor",
          patient: req.isAuthenticated() && req.user.role === "patient",
          notDoctor: !req.isAuthenticated() || req.user.role === "patient",
        });
      })
      .catch((error) => res.json({ error: error.message }));
  } catch (error) {
    res.render("error", {
      layout: 'two.hbs',
      'message': error.message,
      auth: req.isAuthenticated(),
            doctor: req.isAuthenticated() && req.user.role === "doctor",
            patient: req.isAuthenticated() && req.user.role === "patient",
            notDoctor: !req.isAuthenticated() || req.user.role === "patient",
    })
    // res.json({ error: error.message });
  }
});

router.get("/:gid", ensureAuth, async (req, res) => {
  try {
    let user = await User.findOne({ googleId: req.params.gid })
      .lean()
      .then(async (user) => {
        if (user.role === "patient" && req.user.role === "patient") {
          res.redirect("/dashboard");
        } else {
          if (user.role === "patient"){
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

              // console.log(results);
              
              var loggedInProfile = {
                googleId: req.user.googleId,
                displayName: req.user.displayName,
                role: req.user.role,
                email: req.user.email,
                image: req.user.image,
              }
              res.set('page', 'user');
              res.set('role', 'patient')
              res.render("userprofile", {
                layout: 'two.hbs',
                profile: loggedInProfile,
                user: suser,
                results: results.reverse(),
                auth: req.isAuthenticated(),
                doctor: req.isAuthenticated() && req.user.role === "doctor",
                patient: req.isAuthenticated() && req.user.role === "patient",
                notDoctor:
                  !req.isAuthenticated() || req.user.role === "patient",
              });
            })
            .catch((error) => {
              res.render("error", {
                layout: 'two.hbs',
                'message': error.message,
                auth: req.isAuthenticated(),
                      doctor: req.isAuthenticated() && req.user.role === "doctor",
                      patient: req.isAuthenticated() && req.user.role === "patient",
                      notDoctor: !req.isAuthenticated() || req.user.role === "patient",
              })
              // res.json({ error: error.message });
            });
          }
          else {
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
              var loggedInProfile = {
                googleId: req.user.googleId,
                displayName: req.user.displayName,
                role: req.user.role,
                email: req.user.email,
                image: req.user.image,
              }
              res.set('page', 'user');
              res.set('role', 'doctor')
              res.render("doctorprofile", {
                layout: 'two.hbs',
                profile: loggedInProfile,
                user: suser,
                prescriptions: prescriptions.reverse(),
                auth: req.isAuthenticated(),
                doctor: req.isAuthenticated() && req.user.role === "doctor",
                patient: req.isAuthenticated() && req.user.role === "patient",
                notDoctor:
                  !req.isAuthenticated() || req.user.role === "patient",
              });
            })
            .catch((error) => {
    res.render("error", {
      layout: 'two.hbs',
      'message': error.message,
      auth: req.isAuthenticated(),
            doctor: req.isAuthenticated() && req.user.role === "doctor",
            patient: req.isAuthenticated() && req.user.role === "patient",
            notDoctor: !req.isAuthenticated() || req.user.role === "patient",
    })
    // res.json({ error: error.message });
  });
          }
        }
      })
      .catch((error) => {
    res.render("error", {
      layout: 'two.hbs',
      'message': error.message,
      auth: req.isAuthenticated(),
            doctor: req.isAuthenticated() && req.user.role === "doctor",
            patient: req.isAuthenticated() && req.user.role === "patient",
            notDoctor: !req.isAuthenticated() || req.user.role === "patient",
    })
    // res.json({ error: error.message });
  });
  } catch (error) {
    res.render("error", {
      layout: 'two.hbs',
      'message': error.message,
      auth: req.isAuthenticated(),
            doctor: req.isAuthenticated() && req.user.role === "doctor",
            patient: req.isAuthenticated() && req.user.role === "patient",
            notDoctor: !req.isAuthenticated() || req.user.role === "patient",
    })
    // res.json({ error: error.message });
  }
});

module.exports = router;
