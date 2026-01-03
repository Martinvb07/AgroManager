import { testConnection } from '../config/db.js';

async function main() {
  try {
    const ok = await testConnection();
    if (ok) {
      console.log('DB connection: OK');
      process.exit(0);
    } else {
      console.error('DB connection: Query failed');
      process.exit(2);
    }
  } catch (err) {
    console.error('DB connection: ERROR');
    console.error(err?.message || err);
    process.exit(1);
  }
}

main();
