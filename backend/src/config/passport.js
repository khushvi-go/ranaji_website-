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

const clientID = process.env.GOOGLE_CLIENT_ID || 'placeholder-google-client-id.apps.googleusercontent.com';
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'placeholder-google-client-secret';
const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/users/google/callback';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("⚠️ [Passport] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not configured in backend/.env. Using placeholder strategy registration.");
}

passport.use(
  new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL,
    },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value.toLowerCase().trim() : null;
          if (!email) {
            return done(new Error('No email found in Google profile'), null);
          }

          // Find user by email
          let user = await User.findOne({ email });

          // If user doesn't exist, create one
          if (!user) {
            user = await User.create({
              name: profile.displayName || 'Royal Patron',
              email,
              password: null,
              role: "customer",
              provider: "google",
              googleId: profile.id,
              avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
              emailVerified: true,
              lastLogin: new Date(),
            });
          } else {
            // Immediate account revocation check: prevent deactivated accounts from logging in
            if (user.isActive === false) {
              return done(null, false, { message: "Account has been deactivated. Please contact showroom administration." });
            }

            // Update last login & googleId if not present
            user.lastLogin = new Date();
            if (!user.googleId) user.googleId = profile.id;
            await user.save();
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
