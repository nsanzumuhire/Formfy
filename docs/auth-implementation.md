# 🔐 Authentication System Implementation Plan

This document provides a detailed implementation plan for replacing Replit Auth with standard OAuth providers (Google and GitHub).

## 📋 Current Authentication System

The current authentication system relies on Replit's OpenID Connect for authentication:

- Uses `openid-client` package for OpenID Connect
- Relies on Replit-specific environment variables (`REPLIT_DOMAINS`, `REPL_ID`)
- Stores sessions in PostgreSQL using `connect-pg-simple`
- User data is stored in the database with Replit user IDs

## 🏗️ New Authentication Architecture

### Authentication Flow

1. **User initiates login**:
   - User clicks "Sign in with Google" or "Sign in with GitHub"
   - Application redirects to OAuth provider

2. **OAuth provider authentication**:
   - User authenticates with the provider
   - Provider redirects back with authorization code

3. **Token exchange**:
   - Application exchanges code for access and refresh tokens
   - Application verifies token and extracts user information

4. **User session creation**:
   - Application creates or updates user record in database
   - Application creates session and sets secure cookie

### Directory Structure

```
server/
├── auth/
│   ├── index.ts           # Main auth module exports
│   ├── middleware.ts      # Auth middleware functions
│   ├── providers/
│   │   ├── google.ts      # Google OAuth implementation
│   │   ├── github.ts      # GitHub OAuth implementation
│   │   └── types.ts       # Common provider types
│   ├── session.ts         # Session management
│   └── utils.ts           # Auth utilities
```

## 🛠️ Implementation Steps

### 1. Setup Auth Provider Applications

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Navigate to "APIs & Services" > "Credentials"
4. Configure OAuth consent screen
5. Create OAuth client ID (Web application type)
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://your-production-domain.com/api/auth/google/callback` (production)
7. Note Client ID and Client Secret for environment variables

#### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in application details
4. Add authorization callback URL:
   - `http://localhost:5000/api/auth/github/callback` (development)
   - `https://your-production-domain.com/api/auth/github/callback` (production)
5. Note Client ID and Client Secret for environment variables

### 2. Update Database Schema

Add new fields to the user table to support multiple auth providers:

```sql
ALTER TABLE users
ADD COLUMN auth_provider VARCHAR(20),
ADD COLUMN provider_user_id VARCHAR(255),
ADD COLUMN profile_data JSONB;

-- Create a unique constraint on provider + provider_user_id
CREATE UNIQUE INDEX users_provider_id_idx ON users (auth_provider, provider_user_id);
```

### 3. Implement Auth Module

#### Install Required Packages

```bash
npm install passport passport-google-oauth20 passport-github2 express-session connect-pg-simple
```

#### Create Auth Provider Implementations

**auth/providers/types.ts**:
```typescript
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  authProvider: string;
  providerUserId: string;
  profileData: any;
}

export interface AuthProvider {
  name: string;
  setupStrategy(): void;
  getAuthRoutes(): any[];
}
```

**auth/providers/google.ts**:
```typescript
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
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
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Map Google profile to our user structure
            const userData: AuthUser = {
              id: '', // Will be set by storage
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
```

**auth/providers/github.ts**:
```typescript
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
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
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Map GitHub profile to our user structure
            const userData: AuthUser = {
              id: '', // Will be set by storage
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
```

#### Create Session Management

**auth/session.ts**:
```typescript
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { Express } from 'express';

export function setupSession(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: 'sessions',
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: sessionTtl,
      },
    })
  );
}
```

#### Create Auth Middleware

**auth/middleware.ts**:
```typescript
import { Request, Response, NextFunction } from 'express';

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}
```

#### Create Main Auth Module

**auth/index.ts**:
```typescript
import passport from 'passport';
import { Express } from 'express';
import { setupSession } from './session';
import { GoogleAuthProvider } from './providers/google';
import { GitHubAuthProvider } from './providers/github';
import { isAuthenticated } from './middleware';

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
    routes.forEach(route => {
      app[route.method](route.path, route.handler);
    });
  });

  // Add logout route
  app.get('/api/auth/logout', (req, res) => {
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
```

### 4. Update Storage Module

Add new methods to the storage module to handle provider-based authentication:

**server/storage.ts** (additions):
```typescript
import { AuthUser } from './auth/providers/types';

// Add to the storage class
async upsertUserByProvider(userData: AuthUser) {
  const { authProvider, providerUserId, email, firstName, lastName, profileImageUrl, profileData } = userData;
  
  // Check if user exists with this provider
  const existingUser = await db.query.users.findFirst({
    where: and(
      eq(schema.users.authProvider, authProvider),
      eq(schema.users.providerUserId, providerUserId)
    )
  });
  
  if (existingUser) {
    // Update existing user
    const updatedUser = await db
      .update(schema.users)
      .set({
        email,
        firstName,
        lastName,
        profileImageUrl,
        profileData,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, existingUser.id))
      .returning();
    
    return updatedUser[0];
  } else {
    // Create new user
    const newUser = await db
      .insert(schema.users)
      .values({
        email,
        firstName,
        lastName,
        profileImageUrl,
        authProvider,
        providerUserId,
        profileData
      })
      .returning();
    
    return newUser[0];
  }
}
```

### 5. Update Routes

Replace the Replit auth implementation in `server/routes.ts`:

```typescript
// Replace
import { setupAuth, isAuthenticated } from "./replitAuth";

// With
import { setupAuth, isAuthenticated } from "./auth";
```

### 6. Create Login UI

Update the client-side login UI to include buttons for Google and GitHub authentication:

**client/src/pages/landing.tsx** (update):
```tsx
// Add login buttons
<div className="space-y-4">
  <a 
    href="/api/auth/google" 
    className="flex items-center justify-center gap-2 w-full p-2 border rounded-md hover:bg-gray-50"
  >
    <GoogleIcon />
    Sign in with Google
  </a>
  <a 
    href="/api/auth/github" 
    className="flex items-center justify-center gap-2 w-full p-2 border rounded-md hover:bg-gray-50"
  >
    <GitHubIcon />
    Sign in with GitHub
  </a>
</div>
```

## 🧪 Testing

### Test Authentication Flow

1. **Test Google Authentication**:
   - Click "Sign in with Google" button
   - Complete Google authentication
   - Verify redirect back to application
   - Verify user session is created

2. **Test GitHub Authentication**:
   - Click "Sign in with GitHub" button
   - Complete GitHub authentication
   - Verify redirect back to application
   - Verify user session is created

3. **Test Logout**:
   - Click logout button
   - Verify session is destroyed
   - Verify redirect to login page

### Test Protected Routes

1. **Test Authenticated Routes**:
   - Attempt to access protected route while logged out
   - Verify redirect to login page
   - Log in and attempt again
   - Verify successful access

## 🔄 Migration Strategy

1. **Parallel Implementation**:
   - Implement new auth system alongside existing Replit auth
   - Test thoroughly in development environment

2. **Database Migration**:
   - Update database schema
   - Migrate existing users to new schema

3. **Cutover**:
   - Deploy new auth system
   - Remove Replit auth code
   - Monitor for any issues

## 📚 Resources

- [Passport.js Documentation](https://www.passportjs.org/docs/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps) 