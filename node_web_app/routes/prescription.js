const express = require("express");
const router = express.Router();
const { ensureAuth, ensureGuest, ensureDoctor, ensurePatient } = require("../middleware/auth");
const User = require("../models/User");
var spawn = require("child_process").spawn;
const http = require("http");
const io = require("../app.js");
const superagent = require("superagent");
const mongoose = require("mongoose");
const Result = require("../models/Result");
const Prescription = require("../models/Prescription");

router.post("/:resultId", ensureDoctor, async (req, res) => {
  let resultId = req.params.resultId;
  console.log(req.user.googleId);
  console.log(resultId);
  console.log(req.body.prescription);
  var objectId = mongoose.Types.ObjectId(resultId);
  Result.findById(objectId, async (err, mres) => {
    console.log(mres.predictionMain);
    predictionMain = mres.predictionMain;
    console.log(predictionMain);

    console.log("hello", predictionMain);
    await Prescription.create({
      googleId: req.user.googleId,
      resultId: resultId,
      prescription: req.body.prescription,
      user: {
        displayName: req.user.displayName,
        email: req.user.email,
        image: req.user.image,
      },
      predictionMain: predictionMain,
    });
    res.redirect(`/result/${resultId}`);
  });
});

module.exports = router;
