const express = require("express");
const router = express.Router();
const {
  ensureAuth,
  ensureGuest,
  ensureRoleNotChosen,
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

function sortFunction(a, b) {
  if (a.percn === b.percn) {
    return 1;
  } else {
    return a.percn > b.percn ? -1 : 1;
  }
}

function indexOfMax(arr) {
  if (arr.length === 0) {
    return -1;
  }

  var max = arr[0];
  var maxIndex = 0;

  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }

  return maxIndex;
}

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

router.get("/", ensureGuest, (req, res) => {
  res.redirect("/form");
  return
  // console.log(req)
  // try {
  //   res.render("form", {
  //     auth: req.isAuthenticated(),
  //     doctor: req.isAuthenticated() && req.user.role === "doctor",
  //     patient: req.isAuthenticated() && req.user.role === "patient",
  //     notDoctor: !req.isAuthenticated() || req.user.role === "patient",
  //   });
  // } catch (error) {
  //   res.json({ error: error.message });
  // }
});

router.get("/dashboard", ensureAuth, async (req, res) => {
  try {
    if (req.user.role === "patient") {
      let allResults = await Result.find({ googleId: req.user.googleId })
        .lean()
        .then((results) => {
          let suser = {
            displayName: req.user.displayName,
            image: req.user.image,
            googleId: req.user.googleId,
            role: req.user.role,
            email: req.user.email,
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
          // res.body['hehe'] = "huy"
          res.set('page', 'dashboard')
          res.set('role', 'patient')
          res.status(200).render("dashboard", {
            layout : 'two.hbs',
            profile: suser,
            results: results.reverse(),
            auth: req.isAuthenticated(),
            doctor: req.isAuthenticated() && req.user.role === "doctor",
            patient: req.isAuthenticated() && req.user.role === "patient",
            notDoctor: !req.isAuthenticated() || req.user.role === "patient",
          });
        })
        .catch((error) => res.json({ error: error.message }));
    } else {
      let allPres = await Prescription.find({ googleId: req.user.googleId })
        .lean()
        .then((prescriptions) => {
          let suser = {
            displayName: req.user.displayName,
            image: req.user.image,
            googleId: req.user.googleId,
            role: req.user.role,
            email: req.user.email,
          };
          res.set('page', 'dashboard')
          res.set('role', 'doctor')
          res.status(200).render("doctor", {
            layout : 'two.hbs',
            profile: suser,
            prescriptions: prescriptions.reverse(),
            auth: req.isAuthenticated(),
            doctor: req.isAuthenticated() && req.user.role === "doctor",
            patient: req.isAuthenticated() && req.user.role === "patient",
            notDoctor: !req.isAuthenticated() || req.user.role === "patient",
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

router.get("/role", ensureRoleNotChosen, (req, res) => {
  try {
    if (req.isAuthenticated()){
      var loggedInProfile = {
        googleId: req.user.googleId,
        displayName: req.user.displayName,
        role: req.user.role,
        email: req.user.email,
        image: req.user.image,
      }
    }
    else{
      var loggedInProfile = {}
    }
    res.set('page', 'role')
    res.status(200).render("role", {
      layout : 'two.hbs',
      profile: loggedInProfile,
      auth: req.isAuthenticated(),
      doctor: req.isAuthenticated() && req.user.role === "doctor",
      patient: req.isAuthenticated() && req.user.role === "patient",
      notDoctor: !req.isAuthenticated() || req.user.role === "patient",
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

router.get("/form", ensureNotDoctor, (req, res) => {
  try {
    if (req.isAuthenticated()){
      var loggedInProfile = {
        googleId: req.user.googleId,
        displayName: req.user.displayName,
        role: req.user.role,
        email: req.user.email,
        image: req.user.image,
      }
    }
    else{
      var loggedInProfile = {}
    }

    if (req.user) res.set('role', req.user.role)
    else res.set('role', 'guest')
    res.set('page', 'form')
    res.render("form", {
      layout: 'form.hbs',
      profile: loggedInProfile,
      data: symptoms_array,
      auth: req.isAuthenticated(),
      doctor: req.isAuthenticated() && req.user.role === "doctor",
      patient: req.isAuthenticated() && req.user.role === "patient",
      notDoctor: !req.isAuthenticated() || req.user.role === "patient",
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

router.post("/form", ensureNotDoctor, async (req, res) => {
  try {
    // console.log("body", req.body);

    superagent
      .post("http://localhost:8000/polls/")
      .send(req.body)
      .then(async (response) => {
        // console.log(response)
        if (response.body.error){
          res.render("error", {
            layout: 'two.hbs',
            'message': response.body.message,
            auth: req.isAuthenticated(),
            doctor: req.isAuthenticated() && req.user.role === "doctor",
            patient: req.isAuthenticated() && req.user.role === "patient",
            notDoctor: !req.isAuthenticated() || req.user.role === "patient",
          })
          // res.json({ error: "error" });
        }
        else{
          // console.log(response.body);
        // console.log(response.body["result"]);
        resA = response.body["result"];
        var fin = Array();
        // console.log(diseases_array.length);
        // console.log(resA.length);
        var maxind = indexOfMax(resA);
        // console.log(maxind);
        // console.log({
        //   disease: diseases_array[maxind],
        //   percentage: (resA[maxind] * 100).toFixed(2).toString() + "%",
        // });
        if (req.isAuthenticated()) {
          // console.log(req.user);
          res.set('page', 'result')
          res.set('role', req.user.role)
          let result = await Result.create(
            {
              googleId: req.user.googleId,
              symptoms: req.body["symptoms"],
              diseases: resA,
              feeling: req.body['feeling'],
              predictionMain: [
                diseases_array[maxind],
                (resA[maxind] * 100).toFixed(2).toString() + "%",
              ],
            }
          );
          // console.log("result", result)
          res.set('resultId', result._id)
          res.redirect(`/result/${result._id}`);
        } else {
          var maxperc = (resA[maxind] * 100).toFixed(2).toString() + "%";
          // res.send({ symptoms: req.body["symptoms"], diseases: resA });
          fin = Array();
          var mres = { symptoms: req.body["symptoms"], diseases: resA };
          // console.log(mres)
          for (var i = 0; i < diseases_array.length; i++) {
            mres.diseases[i] = {
              name: diseases_array[i],
              percn: mres.diseases[i],
              percs: (mres.diseases[i] * 100).toFixed(2).toString() + "%",
            };
          }
          if (Array.isArray(mres.symptoms)){
            for (var i = 0; i < mres.symptoms.length; i++) {
              mres.symptoms[i] = symptoms_array[mres.symptoms[i]];
            }
          }
          else{
            mres.symptoms = Array(symptoms_array[mres.symptoms])
          }
          // console.log(mres)

          mres.diseases.sort(sortFunction);
          // console.log(resA)
          res.set('page', 'result')
          res.set('role', 'guest')
          res.render("result", {
            diseases: mres.diseases,
            symptoms: mres.symptoms,
            pdn: diseases_array[maxind],
            pdp: maxperc,
            showProfile: false,
            auth: req.isAuthenticated(),
            doctor: req.isAuthenticated() && req.user.role === "doctor",
            patient: req.isAuthenticated() && req.user.role === "patient",
            notDoctor: !req.isAuthenticated() || req.user.role === "patient",
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
        // res.json({ error: error.message })
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

router.post("/role", ensureRoleNotChosen, async (req, res) => {
  // console.log(req.body.role);
  try {

    console.log(req.body.role)
    
    if (!req.body.role && req.body.role!=="doctor" && req.body.role!=="patient"){
      if (req.isAuthenticated()){
        var loggedInProfile = {
          googleId: req.user.googleId,
          displayName: req.user.displayName,
          role: req.user.role,
          email: req.user.email,
          image: req.user.image,
        }
      }
      else{
        var loggedInProfile = {}
      }
      res.render("error", {
        layout: 'two.hbs',
        'profile': loggedInProfile,
        'message': 'Invalid Role Choosen',
        auth: req.isAuthenticated(),
        doctor: req.isAuthenticated() && req.user.role === "doctor",
        patient: req.isAuthenticated() && req.user.role === "patient",
        notDoctor: !req.isAuthenticated() || req.user.role === "patient",
      })
      return
    }
    var query = { googleId: req.user.googleId };
    var newValues = { $set: { role: req.body.role } };
    console.log(query, newValues);
    let user = await User.updateOne(query, newValues);
    console.log(user);
    console.log(
      `${user.matchedCount} document(s) matched the filter, updated ${user.modifiedCount} document(s)`
    );
    res.redirect("/");
  } catch (error) {
    res.render("error", {
      layout: 'two.hbs',
      'message': error.message,
      auth: req.isAuthenticated(),
            doctor: req.isAuthenticated() && req.user.role === "doctor",
            patient: req.isAuthenticated() && req.user.role === "patient",
            notDoctor: !req.isAuthenticated() || req.user.role === "patient",
    })
    // res.send(error);
  }
});

module.exports = router;
