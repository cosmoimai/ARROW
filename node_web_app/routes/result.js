const express = require("express");
const router = express.Router();
const {
  ensureAuth,
  ensureGuest,
  ensureDoctor,
  ensureNotDoctor,
} = require("../middleware/auth");
const User = require("../models/User");
var spawn = require("child_process").spawn;
const http = require("http");
const io = require("../app.js");
const superagent = require("superagent");
const mongoose = require("mongoose");
const Result = require("../models/Result");
const Prescription = require("../models/Prescription");

symptoms_array = ['receiving_blood_transfusion', 'red_sore_around_nose',
'abnormal_menstruation', 'continuous_sneezing', 'breathlessness',
'blackheads', 'shivering', 'dizziness', 'back_pain', 'unsteadiness',
'yellow_crust_ooze', 'muscle_weakness', 'loss_of_balance', 'chills',
'ulcers_on_tongue', 'stomach_bleeding', 'lack_of_concentration', 'coma',
'neck_pain', 'weakness_of_one_body_side', 'diarrhoea',
'receiving_unsterile_injections', 'headache', 'family_history',
'fast_heart_rate', 'pain_behind_the_eyes', 'sweating', 'mucoid_sputum',
'spotting_ urination', 'sunken_eyes', 'dischromic _patches', 'nausea',
'dehydration', 'loss_of_appetite', 'abdominal_pain', 'stomach_pain',
'yellowish_skin', 'altered_sensorium', 'chest_pain', 'muscle_wasting',
'vomiting', 'mild_fever', 'high_fever', 'red_spots_over_body',
'dark_urine', 'itching', 'yellowing_of_eyes', 'fatigue', 'joint_pain',
'muscle_pain']

diseases_array = [
  "Fungal infection",
  "Allergy",
  "GERD",
  "Chronic cholestasis",
  "Drug Reaction",
  "Peptic ulcer diseae",
  "AIDS",
  "Diabetes ",
  "Gastroenteritis",
  "Bronchial Asthma",
  "Hypertension ",
  "Migraine",
  "Cervical spondylosis",
  "Paralysis (brain hemorrhage)",
  "Jaundice",
  "Malaria",
  "Chicken pox",
  "Dengue",
  "Typhoid",
  "hepatitis A",
  "Hepatitis B",
  "Hepatitis C",
  "Hepatitis D",
  "Hepatitis E",
  "Alcoholic hepatitis",
  "Tuberculosis",
  "Common Cold",
  "Pneumonia",
  "Dimorphic hemmorhoids(piles)",
  "Heart attack",
  "Varicose veins",
  "Hypothyroidism",
  "Hyperthyroidism",
  "Hypoglycemia",
  "Osteoarthristis",
  "Arthritis",
  "(vertigo) Paroymsal  Positional Vertigo",
  "Acne",
  "Urinary tract infection",
  "Psoriasis",
  "Impetigo",
];

function sortFunction(a, b) {
  if (a.percn === b.percn) {
    return 1;
  } else {
    return a.percn > b.percn ? -1 : 1;
  }
}

router.get("/:id", ensureAuth, async (req, res) => {
  try {
    console.log(req.params.id);
    var objectId = mongoose.Types.ObjectId(req.params.id);
    Result.findById(objectId, async (err, mres) => {
      fin = Array();
      for (var i = 0; i < diseases_array.length; i++) {
        mres.diseases[i] = {
          name: diseases_array[i],
          percn: mres.diseases[i],
          percs: (mres.diseases[i] * 100).toFixed(2).toString() + "%",
        };
      }
      for (var i = 0; i < mres.symptoms.length; i++) {
        mres.symptoms[i] = symptoms_array[mres.symptoms[i]];
      }
      mres.diseases.sort(sortFunction);

      let user = await User.findOne({ googleId: mres.googleId })
        .lean()
        .then(async (user) => {
          let pro = {
            googleId: user.googleId,
            displayName: user.displayName,
            image: user.image,
            role: user.role.toUpperCase(),
            email: user.email,
          };
          console.log(user);
          boolIsDoctor = false;
          if (req.user.role === "doctor") {
            boolIsDoctor = true;
          }

          var loggedInProfile = {
            googleId: req.user.googleId,
            displayName: req.user.displayName,
            role: req.user.role,
            email: req.user.email,
            image: req.user.image,
          }

          var showProfile = req.user.googleId === mres.googleId || boolIsDoctor;

          let queryPres = await Prescription.find({ resultId: req.params.id })
            .lean()
            .then(async (prescriptions) => {
              console.log(req.user.googleId, mres.googleId);
              if (showProfile) {
                res.render("result", {
                  profile: loggedInProfile,
                  resultId: req.params.id,
                  diseases: mres.diseases,
                  symptoms: mres.symptoms,
                  createdAt: mres.createdAt,
                  user: pro,
                  pdn: mres.predictionMain[0],
                  pdp: mres.predictionMain[1],
                  prescriptions: prescriptions.reverse(),
                  showProfile: showProfile,
                  auth: req.isAuthenticated(),
                  doctor: req.isAuthenticated() && req.user.role === "doctor",
                  patient: req.isAuthenticated() && req.user.role === "patient",
                  notDoctor:
                    !req.isAuthenticated() || req.user.role === "patient",
                });
              } else {
                res.render("result", {
                  profile: loggedInProfile,
                  resultId: req.params.id,
                  diseases: mres.diseases,
                  symptoms: mres.symptoms,
                  createdAt: mres.createdAt,
                  pdn: mres.predictionMain[0],
                  pdp: mres.predictionMain[1],
                  prescriptions: prescriptions.reverse(),
                  showProfile: showProfile,
                  auth: req.isAuthenticated(),
                  doctor: req.isAuthenticated() && req.user.role === "doctor",
                  patient: req.isAuthenticated() && req.user.role === "patient",
                  notDoctor:
                    !req.isAuthenticated() || req.user.role === "patient",
                });
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
              // res.json({ error: error.message })
            } );
        });
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
