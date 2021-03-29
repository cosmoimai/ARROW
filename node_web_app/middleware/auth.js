module.exports = {
  ensureAuth: (req, res, next) => {
    if (req.isAuthenticated()) {
      res.auth = true
      if (req.user.role === undefined) {
        res.redirect("/role");
        return;
      }
      return next();
    } else {
      res.guest = true
      res.redirect("/");
    }
  },
  ensureGuest: (req, res, next) => {
    if (req.isAuthenticated()) {
      res.auth = true
      if (req.user.role === undefined) {
        res.redirect("/role");
        return;
      }
      res.redirect("/dashboard");
    } else {
      res.guest = true
      return next();
    }
  },
  ensureRoleNotChosen: (req, res, next) => {
    if (req.isAuthenticated()) {
      res.auth = true
      if (req.user.role !== undefined) {
        res.redirect("/");
        return;
      }
      res.RoleNotChosen = true
      return next();
    } else {
      res.guest = true
      res.redirect("/");
    }
  },
  ensurePatient: (req, res, next) => {
    if (req.isAuthenticated()) {
      res.auth = true
      if (req.user.role === "patient") {
        res.patient = true
        return next();
      }
      else{
        res.redirect("/dashboard")
      }
    } else {
      res.guest = true
      res.redirect("/");
    }
  },
  ensureDoctor: (req, res, next) => {
    if (req.isAuthenticated()) {
      res.auth = true
      if (req.user.role === "doctor") {
        res.doctor = true
        return next();
      }
      else{
        res.redirect("/dashboard")
      }
    } else {
      res.guest = true
      res.redirect("/");
    }
  },
};
