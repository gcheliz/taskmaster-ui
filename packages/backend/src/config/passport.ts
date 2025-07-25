import passport from 'passport';
import {
  Strategy as GoogleStrategy,
  Profile as GoogleProfile,
  VerifyCallback,
} from 'passport-google-oauth20';
import {
  Strategy as GitHubStrategy,
  Profile as GitHubProfile,
} from 'passport-github2';
import AuthService from '../services/authService';
import { env } from './environment';
import { securityLogger } from '../utils/bootstrap-logger';

// User serialization for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await AuthService.getUserById(id);
    if (user) {
      const passportUser = {
        userId: user.id,
        email: user.email,
        name: user.name,
      };
      done(null, passportUser);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error, false);
  }
});

// Google OAuth Strategy
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: GoogleProfile,
        done: VerifyCallback
      ) => {
        try {
          const avatar = profile.photos?.[0]?.value;
          const userResult = await AuthService.findOrCreateOAuthUser({
            provider: 'google',
            providerId: profile.id,
            email: profile.emails?.[0]?.value || '',
            name:
              profile.displayName ||
              profile.name?.givenName + ' ' + profile.name?.familyName ||
              '',
            ...(avatar !== undefined && { avatar }),
          });

          const passportUser = {
            userId: userResult.user.id,
            email: userResult.user.email,
            name: userResult.user.name,
          };
          done(null, passportUser);
        } catch (error) {
          done(error, false);
        }
      }
    )
  );
} else {
  securityLogger.warn(
    'Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET'
  );
}

// GitHub OAuth Strategy
if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        callbackURL: env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: GitHubProfile,
        done: VerifyCallback
      ) => {
        try {
          const userResult = await AuthService.findOrCreateOAuthUser({
            provider: 'github',
            providerId: profile.id,
            email:
              profile.emails?.[0]?.value || (profile as any)._json?.email || '',
            name: profile.displayName || profile.username || '',
            avatar:
              profile.photos?.[0]?.value || (profile as any)._json?.avatar_url,
          });

          const passportUser = {
            userId: userResult.user.id,
            email: userResult.user.email,
            name: userResult.user.name,
          };
          done(null, passportUser);
        } catch (error) {
          done(error, false);
        }
      }
    )
  );
} else {
  securityLogger.warn(
    'GitHub OAuth not configured - missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET'
  );
}

export default passport;
