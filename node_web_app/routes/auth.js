const express = require("express");
const passport = require("passport");
const router = express.Router();
const { ensureGuest, ensureAuth } = require('../middleware/auth')

router.get(
  "/google",  ensureGuest,
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  })
);

router.get(
  "/google/callback", ensureGuest,
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard/");
  }
);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/form");
});

module.exports = router;
