const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

const passportInit = () => {
  passport.use(
    "local",
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email: email });
          if (!user) {
            return done(null, false, { message: "Incorrect credentials." });
          }

          const result = await user.comparePassword(password);
          return result 
              ? done(null, user)
              : done(null, false, { message: "Incorrect credentials." });
        } catch (e) {
          return done(e);
        }
      }
    )
  );

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function (id, done) {
    try {
      const user = await User.findById(id);
      return user 
          ? done(null, user)
          : done(new Error("user not found"));
    } catch (e) {
      done(e);
    }
});
};

module.exports = passportInit;