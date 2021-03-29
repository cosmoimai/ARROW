const express = require("express");
const router = express.Router();
const { ensureAuth, ensureGuest, ensureDoctor, ensureNotDoctor } = require("../middleware/auth");
const User = require("../models/User");
var spawn = require("child_process").spawn;
const http = require("http");
const io = require("../app.js");
const superagent = require("superagent");
const mongoose = require("mongoose");
const Result = require("../models/Result");
const Prescription = require("../models/Prescription");

symptoms_array = [
  "itching",
  "skin_rash",
  "nodal_skin_eruptions",
  "continuous_sneezing",
  "shivering",
  "chills",
  "joint_pain",
  "stomach_pain",
  "acidity",
  "ulcers_on_tongue",
  "muscle_wasting",
  "vomiting",
  "burning_micturition",
  "spotting_ urination",
  "fatigue",
  "weight_gain",
  "anxiety",
  "cold_hands_and_feets",
  "mood_swings",
  "weight_loss",
  "restlessness",
  "lethargy",
  "patches_in_throat",
  "irregular_sugar_level",
  "cough",
  "high_fever",
  "sunken_eyes",
  "breathlessness",
  "sweating",
  "dehydration",
  "indigestion",
  "headache",
  "yellowish_skin",
  "dark_urine",
  "nausea",
  "loss_of_appetite",
  "pain_behind_the_eyes",
  "back_pain",
  "constipation",
  "abdominal_pain",
  "diarrhoea",
  "mild_fever",
  "yellow_urine",
  "yellowing_of_eyes",
  "acute_liver_failure",
  "fluid_overload",
  "swelling_of_stomach",
  "swelled_lymph_nodes",
  "malaise",
  "blurred_and_distorted_vision",
  "phlegm",
  "throat_irritation",
  "redness_of_eyes",
  "sinus_pressure",
  "runny_nose",
  "congestion",
  "chest_pain",
  "weakness_in_limbs",
  "fast_heart_rate",
  "pain_during_bowel_movements",
  "pain_in_anal_region",
  "bloody_stool",
  "irritation_in_anus",
  "neck_pain",
  "dizziness",
  "cramps",
  "bruising",
  "obesity",
  "swollen_legs",
  "swollen_blood_vessels",
  "puffy_face_and_eyes",
  "enlarged_thyroid",
  "brittle_nails",
  "swollen_extremeties",
  "excessive_hunger",
  "extra_marital_contacts",
  "drying_and_tingling_lips",
  "slurred_speech",
  "knee_pain",
  "hip_joint_pain",
  "muscle_weakness",
  "stiff_neck",
  "swelling_joints",
  "movement_stiffness",
  "spinning_movements",
  "loss_of_balance",
  "unsteadiness",
  "weakness_of_one_body_side",
  "loss_of_smell",
  "bladder_discomfort",
  "foul_smell_of urine",
  "continuous_feel_of_urine",
  "passage_of_gases",
  "internal_itching",
  "toxic_look_(typhos)",
  "depression",
  "irritability",
  "muscle_pain",
  "altered_sensorium",
  "red_spots_over_body",
  "belly_pain",
  "abnormal_menstruation",
  "dischromic _patches",
  "watering_from_eyes",
  "increased_appetite",
  "polyuria",
  "family_history",
  "mucoid_sputum",
  "rusty_sputum",
  "lack_of_concentration",
  "visual_disturbances",
  "receiving_blood_transfusion",
  "receiving_unsterile_injections",
  "coma",
  "stomach_bleeding",
  "distention_of_abdomen",
  "history_of_alcohol_consumption",
  "fluid_overload.1",
  "blood_in_sputum",
  "prominent_veins_on_calf",
  "palpitations",
  "painful_walking",
  "pus_filled_pimples",
  "blackheads",
  "scurring",
  "skin_peeling",
  "silver_like_dusting",
  "small_dents_in_nails",
  "inflammatory_nails",
  "blister",
  "red_sore_around_nose",
  "yellow_crust_ooze",
];

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

        var showProfile = req.user.googleId === mres.googleId || boolIsDoctor;


        let queryPres = await Prescription.find({ resultId: req.params.id })
          .lean()
          .then(async (prescriptions) => {
            console.log(req.user.googleId , mres.googleId)
            if (showProfile){
              res.render("result", {
              resultId: req.params.id,
              diseases: mres.diseases,
              symptoms: mres.symptoms,
              createdAt: mres.createdAt,
              user: pro,
              pdn: mres.predictionMain[0],
              pdp: mres.predictionMain[1],
              prescriptions: prescriptions.reverse(),
              showProfile: showProfile,
              auth: req.isAuthenticated(), doctor: req.isAuthenticated() && req.user.role==="doctor", patient: req.isAuthenticated() && req.user.role==="patient", notDoctor: !req.isAuthenticated() ||  req.user.role==="patient"
            });
            }
            else{
              res.render("result", {
              resultId: req.params.id,
              diseases: mres.diseases,
              symptoms: mres.symptoms,
              createdAt: mres.createdAt,
              pdn: mres.predictionMain[0],
              pdp: mres.predictionMain[1],
              prescriptions: prescriptions.reverse(),
              showProfile: showProfile,
              auth: req.isAuthenticated(), doctor: req.isAuthenticated() && req.user.role==="doctor", patient: req.isAuthenticated() && req.user.role==="patient", notDoctor: !req.isAuthenticated() ||  req.user.role==="patient"
              });
            }
          });
      });
  });
});

module.exports = router;
