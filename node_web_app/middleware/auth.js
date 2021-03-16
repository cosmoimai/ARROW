module.exports = {
  ensureAuth: (req, res, next) => {
    if (req.isAuthenticated()) {
      if (req.user.role === undefined) {
        res.redirect("/role");
        return;
      }
      return next();
    } else {
      res.redirect("/");
    }
  },
  ensureGuest: (req, res, next) => {
    if (req.isAuthenticated()) {
      if (req.user.role === undefined) {
        res.redirect("/role");
        return;
      }
      res.redirect("/dashboard");
    } else {
      return next();
    }
  },
};
