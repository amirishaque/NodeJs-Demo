const router = require("express").Router();
const { userAuth, checkRole } = require("../Middlewares/role");
const { ROLE } = require("../config/roles");
const passport = require("passport");

router.get("/", (req, res) => {
  res.send("Testing ???");
});
// Authentication Router Middleware

// Admin Protected Route
router.use("/admin", userAuth, checkRole([ROLE.admin]), require("../Controllers/admin/adminController"));
router.use("/customer", userAuth, checkRole([ROLE.customer]), require("../Controllers/customer/customerCOntroller"));
router.use("/seller", userAuth, checkRole([ROLE.seller]), require("../Controllers/seller/sellerController"));

router.use("/registerLogin", require("../Controllers/registerLoginController"));

module.exports = router;