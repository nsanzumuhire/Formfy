import passport from 'passport';
import { Express, Request } from 'express';
import { setupSession } from './session';
import { GoogleAuthProvider } from './providers/google';
import { GitHubAuthProvider } from './providers/github';
import { isAuthenticated } from './middleware';

interface RouteConfig {
    path: string;
    method: string;
    handler: any;
}

// Create providers
const providers = [new GoogleAuthProvider(), new GitHubAuthProvider()];

export function setupAuth(app: Express) {
    // Setup session
    setupSession(app);

    // Initialize passport
    app.use(passport.initialize());
    app.use(passport.session());

    // Setup serialization
    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));

    // Setup strategies
    providers.forEach(provider => provider.setupStrategy());

    // Register auth routes
    providers.forEach(provider => {
        const routes = provider.getAuthRoutes();
        routes.forEach((route: RouteConfig) => {
            if (route.method === 'get') {
                app.get(route.path, route.handler);
            } else if (route.method === 'post') {
                app.post(route.path, route.handler);
            }
        });
    });

    // Add logout route
    app.get('/api/auth/logout', (req: Request, res) => {
        req.logout(() => {
            res.redirect('/');
        });
    });

    // Add user info route
    app.get('/api/auth/user', isAuthenticated, (req, res) => {
        res.json(req.user);
    });
}

export { isAuthenticated }; 