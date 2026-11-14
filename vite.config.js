import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import handler from './api/concierge.js';

function conciergeDevPlugin() {
  return {
    name: 'concierge-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/concierge' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            try {
              const fakeReq = new Request('http://localhost:5173/api/concierge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body
              });
              const response = await handler(fakeReq);
              const text = await response.text();
              res.statusCode = response.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(text);
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [react(), conciergeDevPlugin()],
    envPrefix: ['VITE_', 'SUPABASE_', 'GEMINI_'],
    server: {
      port: 5173,
      host: true
    }
  };
});
