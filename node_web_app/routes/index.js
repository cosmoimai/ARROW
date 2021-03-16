const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
// const mongoose = require('mongoose')
const User = require('../models/User')
var spawn = require('child_process').spawn;
const http = require('http')
const io = require('../app.js')
const superagent = require('superagent')
const mongoose = require('mongoose')
const Result = require('../models/Result')
// const User = require('../models/User')
// var zerorpc = require("zerorpc");

function sortFunction(a, b) {
    if (a[1] === b[1]) {
        return 1;
    }
    else {
        return (a[1] > b[1]) ? -1 : 1;
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
//

router.get('/', ensureGuest, (req, res) => {
    res.render('login')
})

router.get('/dashboard', ensureAuth, async (req, res) => {

    let allResults = await Result.find({ googleId: req.user.googleId }).lean().
    then(results => {
        let suser = {
            displayName: req.user.displayName,
            image: req.user.image,
            googleId: req.user.googleId,
            role: req.user.role
        }
        // let sres = results.toJSON()
        // fin = Array()
        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour:'numeric', minute:'numeric', second:'numeric' };

        for (var i=0; i<results.length; i++){
            results[i] = {
                resultId : results[i]._id,
                maindisease : (results[i].predictionMain)[0],
                mainpercentage : (results[i].predictionMain)[1],
                createdAt : results[i].createdAt.toLocaleDateString("en-US", options)
            }
        }
        // let sres = {
        //     resultId : results._id,
        //     mainDisease : (results.predictionMain)[0],
        //     mainpercentage : (results.predictionMain)[1]
        // }
        // console.log({profile: suser, results: results})
        // results.forEach(result => {
        //     result.symptoms.forEach(symptom => {
        //         symptom = symptoms_array[symptom]
        //     })
        //     // result.diseases.forEach(disease => {
        //     //     disease = {}
        //     // })
        // })

        // for (var i=0; i<results.length; i++){
        //     console.log(i)
        //     for (var j=0; j<results[i].symptoms.length; j++){
        //         console.log(j)
        //         results[i].symptoms[j] = symptoms_array[parseInt(results[i].symptoms[j])]
        //         // console.log(symptoms_array[result[i][symptoms[j]]])
        //     }
        //     for (var j=0; j<results[i].diseases.length; j++){
        //         results[i].diseases[j] = [
        //             diseases_array[j], results[i].diseases[j]
        //         ]
        //     }
        // }

        console.log(results)

        // console.log("results", results)

        // for (var i=0; i<diseases.length; i++){
        //         // console.log(diseases[i], resA[i])
        //         fin[i] = [diseases[i], results.diseases[i]]
        //     }
        //     fin.sort(sortFunction);
        //     console.log(fin)

        //     // res.render('result', {data: fin})
        //     print(fin)

        // res.send("Hello")

        // res.render('dashboard', {profile: suser, results: results, diseases: diseases_array, symptoms: symptoms_array})
        res.render('dashboard', {profile: suser, results: results.reverse()})
    }).
    catch(error => res.json({ error: error.message }));


    // console.log(req.user)
    // let allResults = await Result.find({ googleId: req.user.googleId }, (err, results) => {
    //     let suser = {
    //         displayName: req.user.displayName,
    //         image: req.user.image,
    //         googleId: req.user.googleId
    //     }
    //     let sres = results.toJSON()
    //     console.log({profile: suser, results: sres})
    //     res.render('dashboard', {profile: suser, results: sres})
    // })
    // res.render('dashboard', req.user)
})


router.get('/role', (req, res) => {
    // console.log(req.user)
    res.render('role')
})

router.post('/role', async (req, res) => {
    // console.log(req.user)
    console.log(req.body.role)
    try {
        var query = { googleId: req.user.googleId };
        var newValues = { $set: { role: req.body.role } };
        console.log(query, newValues)
        let user = await User.updateOne(query, newValues)
        console.log(user)
        console.log(

            `${user.matchedCount} document(s) matched the filter, updated ${user.modifiedCount} document(s)`,
      
          );
    } catch (error) {
        console.log(error)
    }
    res.redirect('/')
})

module.exports = router