import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile, VerifyCallback } from 'passport-google-oauth20';
import { storage } from '../../storage';
import { AuthProvider, AuthUser } from './types';

export class GoogleAuthProvider implements AuthProvider {
    name = 'google';

    setupStrategy() {
        passport.use(
            new GoogleStrategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID!,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                    callbackURL: '/api/auth/google/callback',
                    scope: ['profile', 'email'],
                },
                async (
                    accessToken: string,
                    refreshToken: string,
                    profile: GoogleProfile,
                    done: VerifyCallback
                ) => {
                    try {
                        // Map Google profile to our user structure
                        const userData: AuthUser = {
                            email: profile.emails?.[0]?.value || '',
                            firstName: profile.name?.givenName || '',
                            lastName: profile.name?.familyName || '',
                            profileImageUrl: profile.photos?.[0]?.value,
                            authProvider: 'google',
                            providerUserId: profile.id,
                            profileData: profile,
                        };

                        // Create or update user in database
                        const user = await storage.upsertUserByProvider(userData);
                        done(null, user);
                    } catch (error) {
                        done(error as Error);
                    }
                }
            )
        );
    }

    getAuthRoutes() {
        return [
            {
                path: '/api/auth/google',
                method: 'get',
                handler: passport.authenticate('google'),
            },
            {
                path: '/api/auth/google/callback',
                method: 'get',
                handler: passport.authenticate('google', {
                    successRedirect: '/',
                    failureRedirect: '/login',
                }),
            },
        ];
    }
} 