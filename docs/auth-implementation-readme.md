# 🔐 OAuth Authentication Implementation

This document provides an overview of the OAuth authentication implementation that replaces the Replit Auth system.

## 📋 Overview

The authentication system now supports Google and GitHub as OAuth providers, allowing users to authenticate using their existing accounts. The system is built with:

- **Passport.js**: For OAuth strategy implementation
- **Express-session**: For session management
- **Connect-pg-simple**: For PostgreSQL session storage
- **TypeScript**: For type safety

## 🏗️ Architecture

The authentication system follows a modular architecture:

```
server/
├── auth/
│   ├── index.ts           # Main auth module exports
│   ├── middleware.ts      # Auth middleware functions
│   ├── providers/
│   │   ├── google.ts      # Google OAuth implementation
│   │   ├── github.ts      # GitHub OAuth implementation
│   │   └── types.ts       # Common provider types
│   └── session.ts         # Session management
```

## 🛠️ Implementation Details

### Authentication Flow

1. **User initiates login**:
   - User clicks "Sign in with Google" or "Sign in with GitHub"
   - Application redirects to OAuth provider

2. **OAuth provider authentication**:
   - User authenticates with the provider
   - Provider redirects back with authorization code

3. **Token exchange**:
   - Application exchanges code for access token
   - Application verifies token and extracts user information

4. **User session creation**:
   - Application creates or updates user record in database
   - Application creates session and sets secure cookie

### Database Schema

The user table has been extended with the following fields:

- `authProvider`: The name of the OAuth provider (google, github)
- `providerUserId`: The user ID from the provider
- `profileData`: JSON data containing the user's profile information from the provider

### Session Management

Sessions are stored in PostgreSQL using `connect-pg-simple`, providing:

- Persistent sessions across server restarts
- Secure cookie handling
- Session expiration and cleanup

## 🧪 Testing

You can test the authentication system using:

```bash
npm run test:auth
```

This will start a test server that allows you to:
- Sign in with Google or GitHub
- View your authenticated user information
- Test the logout functionality

## 📚 Resources

- [Passport.js Documentation](https://www.passportjs.org/docs/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps) 