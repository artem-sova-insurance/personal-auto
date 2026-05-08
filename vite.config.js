import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function mockApiPlugin() {
  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use('/api/submit', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end('Method Not Allowed'); return; }
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            console.log('\n🚗 [DEV] Auto insurance form submission:');
            console.log(`  Name  : ${data.firstName} ${data.lastName}`);
            console.log(`  Email : ${data.email}`);
            console.log(`  State : ${data.state}`);
            console.log(`  Vehicles: ${(data.vehicles || []).length}`);
            console.log('  (No emails/Slack/Airtable sent in dev mode)\n');
          } catch (_) {}
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, dev: true }));
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), mockApiPlugin()],
  build: {
    rollupOptions: { output: { manualChunks: undefined } },
  },
});
