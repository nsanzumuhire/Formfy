import dotenv from 'dotenv';
import express from 'express';
import { setupAuth } from '../server/auth';

dotenv.config();

// Check for required environment variables
const requiredEnvVars = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

async function main() {
    const app = express();

    // Setup auth
    await setupAuth(app);

    // Add a simple home route
    app.get('/', (req, res) => {
        if (req.isAuthenticated()) {
            res.send(`
        <h1>Authenticated!</h1>
        <p>User: ${JSON.stringify(req.user)}</p>
        <a href="/api/auth/logout">Logout</a>
      `);
        } else {
            res.send(`
        <h1>Not authenticated</h1>
        <a href="/api/auth/google">Login with Google</a><br>
        <a href="/api/auth/github">Login with GitHub</a>
      `);
        }
    });

    // Add a login page
    app.get('/login', (req, res) => {
        res.send(`
      <h1>Login</h1>
      <a href="/api/auth/google">Login with Google</a><br>
      <a href="/api/auth/github">Login with GitHub</a>
    `);
    });

    // Start server
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`Test auth server running at http://localhost:${port}`);
    });
}

main().catch(err => {
    console.error('Error starting test auth server:', err);
    process.exit(1);
}); 