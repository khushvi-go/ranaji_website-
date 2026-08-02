const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();
const User = require("../models/User");

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Find user by email
          let user = User.findByEmail(profile.emails[0].value);
  
          // If user doesn't exist, create one
          if (!user) {
            user = User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              password: "",
              role: "customer",
              provider: "google",
              googleId: profile.id,
              emailVerified: true,
              lastLogin: new Date().toISOString(),
            });
          } else {
            // Update last login
            User.update(user._id, {
              lastLogin: new Date().toISOString(),
            });
          }
  
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );