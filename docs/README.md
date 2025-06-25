# Formfy Migration Documentation

This directory contains documentation for migrating the Formfy application from Replit dependencies to a self-contained application that can run in any environment.

## Documentation Index

- [Migration Plan](./replit-migration-plan.md) - Overview of the migration process and objectives
- [Authentication Implementation](./auth-implementation.md) - Detailed plan for replacing Replit Auth with standard OAuth
- [Environment Variables](./env-template.md) - Template and documentation for required environment variables

## Quick Start

1. Create a `.env` file in the project root based on the [environment template](./env-template.md)
2. Install dependencies: `npm install`
3. Run database migrations: `npm run db:push`
4. Start the development server: `npm run dev`

## Migration Checklist

- [ ] Set up OAuth applications with Google and GitHub
- [ ] Update database schema for multi-provider authentication
- [ ] Implement new authentication module
- [ ] Remove Replit-specific code and dependencies
- [ ] Update client-side authentication UI
- [ ] Test all authentication flows
- [ ] Document deployment process for production environments

## Contributing to the Migration

When contributing to this migration effort, please:

1. Follow the architecture outlined in the documentation
2. Maintain backward compatibility where possible during the transition
3. Add comprehensive tests for new functionality
4. Update documentation as needed

## Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Passport.js Documentation](https://www.passportjs.org/docs/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html) 