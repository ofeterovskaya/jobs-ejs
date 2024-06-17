const express = require("express");
const passport = require("passport");
const router = express.Router();
const csrfProtection = require("../middleware/csrfProtection");

const {
  logonShow,
  registerShow,
  registerDo,
  logoff,
} = require("../controllers/sessionController");

router.route("/register")
  .get(csrfProtection, registerShow)
  .post(csrfProtection, registerDo);

router.route("/logon")
  .get(csrfProtection, logonShow)
  .post(csrfProtection, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/sessions/logon",
    failureFlash: true,
  }));

router.route("/logoff").post(csrfProtection, logoff);

module.exports = router;