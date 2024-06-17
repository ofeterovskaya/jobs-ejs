const express = require("express");
const router = express.Router();
const csrfProtection = require("../middleware/csrfProtection");

router.get("/", csrfProtection, (req, res) => {
  req.session.secretWord ||= "syzygy";
  res.render("secretWord", { secretWord: req.session.secretWord, csrfToken: req.csrfToken() });
});

router.post("/", csrfProtection, (req, res) => {
  if (req.body.secretWord?.toLowerCase().startsWith("p")) {
    req.flash("error", "That word won't work!");
    req.flash("error", "You can't use words that start with p.");
  } else {
    req.session.secretWord = req.body.secretWord;
    req.flash("info", "The secret word was changed.");
  }

  res.redirect("/secretWord");
});

module.exports = router;