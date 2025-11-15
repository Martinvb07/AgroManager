import http from 'http';
import app from './app.js';
import { env } from './config/env.js';

const server = http.createServer(app);
const PORT = env.PORT;

server.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

// Basic shutdown handling
const shutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  // Force exit if not closed in time
  setTimeout(() => process.exit(1), 10000).unref();
};

['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));
