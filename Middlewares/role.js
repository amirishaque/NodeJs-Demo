const passport = require("passport");


const userAuth = passport.authenticate("jwt", { session: false });

const checkRole = (roles) => (req, res, next) => {
  !roles.includes(req.user.role)
    ? res.status(401).json("Unauthorized")
    : next();
};


module.exports = {
  userAuth,
  checkRole
};
