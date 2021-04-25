module.exports = {
  ensureAuth: (req, res, next) => {
    if (req.isAuthenticated()) {
      res.auth = true
      // console.log(req.user.role)
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
      // console.log(req.user.role)
      res.redirect("/dashboard")
    } else {
      res.guest = true
      return next();
    }
  },
  ensureRoleNotChosen: (req, res, next) => {
    if (req.isAuthenticated()) {
      res.auth = true
      if (req.user.role !== undefined) {
        res.redirect("/dashboard");
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
      else if (req.user.role === "doctor"){
        res.redirect("/dashboard")
      }
      else {
        res.redirect("/role");
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
      else if (req.user.role === "patient"){
        res.redirect("/dashboard")
      }
      else {
        res.redirect("/role");
      }
    } else {
      res.guest = true
      res.redirect("/");
    }
  },
  ensureNotDoctor: (req, res, next) => {
    if (req.isAuthenticated()) {
      res.auth = true
      if (req.user.role === "patient") {
        res.set('role', 'patient')
        res.notDoctor = true
        return next();
      }
      else if (req.user.role === "doctor"){
        res.redirect("/dashboard")
      }
      else {
        res.redirect("/role")
      }
    } else {
      res.set('role', 'guest')
      res.guest = true
      res.notDoctor = true
      return next();
    }
  }
};
