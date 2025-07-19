"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_github2_1 = require("passport-github2");
const authService_1 = __importDefault(require("../services/authService"));
const environment_1 = require("./environment");
// User serialization for session
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await authService_1.default.getUserById(id);
        if (user) {
            const passportUser = {
                userId: user.id,
                email: user.email,
                name: user.name,
            };
            done(null, passportUser);
        }
        else {
            done(null, false);
        }
    }
    catch (error) {
        done(error, false);
    }
});
// Google OAuth Strategy
if (environment_1.env.GOOGLE_CLIENT_ID && environment_1.env.GOOGLE_CLIENT_SECRET) {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: environment_1.env.GOOGLE_CLIENT_ID,
        clientSecret: environment_1.env.GOOGLE_CLIENT_SECRET,
        callbackURL: environment_1.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const userResult = await authService_1.default.findOrCreateOAuthUser({
                provider: 'google',
                providerId: profile.id,
                email: profile.emails?.[0]?.value || '',
                name: profile.displayName || profile.name?.givenName + ' ' + profile.name?.familyName || '',
                avatar: profile.photos?.[0]?.value,
            });
            const passportUser = {
                userId: userResult.user.id,
                email: userResult.user.email,
                name: userResult.user.name,
            };
            done(null, passportUser);
        }
        catch (error) {
            done(error, false);
        }
    }));
}
else {
    console.warn('Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}
// GitHub OAuth Strategy
if (environment_1.env.GITHUB_CLIENT_ID && environment_1.env.GITHUB_CLIENT_SECRET) {
    passport_1.default.use(new passport_github2_1.Strategy({
        clientID: environment_1.env.GITHUB_CLIENT_ID,
        clientSecret: environment_1.env.GITHUB_CLIENT_SECRET,
        callbackURL: environment_1.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const userResult = await authService_1.default.findOrCreateOAuthUser({
                provider: 'github',
                providerId: profile.id,
                email: profile.emails?.[0]?.value || profile._json?.email || '',
                name: profile.displayName || profile.username || '',
                avatar: profile.photos?.[0]?.value || profile._json?.avatar_url,
            });
            const passportUser = {
                userId: userResult.user.id,
                email: userResult.user.email,
                name: userResult.user.name,
            };
            done(null, passportUser);
        }
        catch (error) {
            done(error, false);
        }
    }));
}
else {
    console.warn('GitHub OAuth not configured - missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET');
}
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map