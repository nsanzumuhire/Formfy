import passport from 'passport';
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from 'passport-github2';
import { storage } from '../../storage';
import { AuthProvider, AuthUser } from './types';

export class GitHubAuthProvider implements AuthProvider {
    name = 'github';

    setupStrategy() {
        passport.use(
            new GitHubStrategy(
                {
                    clientID: process.env.GITHUB_CLIENT_ID!,
                    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
                    callbackURL: '/api/auth/github/callback',
                    scope: ['user:email'],
                },
                async (
                    accessToken: string,
                    refreshToken: string,
                    profile: GitHubProfile,
                    done: (error: Error | null, user?: any) => void
                ) => {
                    try {
                        // Map GitHub profile to our user structure
                        const userData: AuthUser = {
                            email: profile.emails?.[0]?.value || '',
                            firstName: profile.displayName?.split(' ')[0] || '',
                            lastName: profile.displayName?.split(' ').slice(1).join(' ') || '',
                            profileImageUrl: profile.photos?.[0]?.value,
                            authProvider: 'github',
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
                path: '/api/auth/github',
                method: 'get',
                handler: passport.authenticate('github'),
            },
            {
                path: '/api/auth/github/callback',
                method: 'get',
                handler: passport.authenticate('github', {
                    successRedirect: '/',
                    failureRedirect: '/login',
                }),
            },
        ];
    }
} 