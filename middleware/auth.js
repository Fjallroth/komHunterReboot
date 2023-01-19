module.exports = {
    ensureAuth: function (req, res, next) {
      if (req.isAuthenticated()) {
        console.log(req.sessionID)
        return next()
      } else {
        console.log(req.sessionID)
        console.log("user not authenicated")
        return res.redirect('/')
      }
    }
  }
  