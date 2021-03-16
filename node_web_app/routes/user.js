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

router.get('/', (req, res) => {
    let all = User.find({}, (err, users) => {
        res.send(users)
    })
    // console.log(all)
    // res.send("ad")
})

router.get('/:gid', async (req, res) => {
    let user = await User.findOne({ googleId: req.params.gid })
    let allResults = await Result.find({ googleId: req.params.gid }, (err, results) => {
        res.send({profile: user, results: results})
    })
    // res.send(user)
    // console.log(all)
    // res.send("ad")
})

module.exports = router