const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const mongoose = require('mongoose')
const User = require('../models/User')

router.get('/', ensureGuest, (req, res) => {
    res.render('login')
})

router.get('/dashboard', ensureAuth, (req, res) => {
    // console.log(req.user)
    res.render('dashboard', req.user)
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