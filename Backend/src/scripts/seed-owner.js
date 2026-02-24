import { env } from '../config/env.js';
import { usuariosService } from '../services/usuarios.service.js';
import { getPool } from '../config/db.js';

async function main() {
  const email = process.env.SEED_OWNER_EMAIL;
  const password = process.env.SEED_OWNER_PASSWORD;
  const nombre = process.env.SEED_OWNER_NAME || 'Owner';

  if (!email || !password) {
    console.error(
      'Missing SEED_OWNER_EMAIL / SEED_OWNER_PASSWORD.\n' +
        'Example:\n' +
        '  SEED_OWNER_EMAIL=owner@agromanager.local SEED_OWNER_PASSWORD=ChangeMe123! node src/scripts/seed-owner.js'
    );
    process.exit(2);
  }

  // Force pool init early so connection errors are explicit.
  getPool();

  const pool = getPool();
  const [existingOwners] = await pool.query(
    "SELECT id FROM usuarios WHERE LOWER(rol) = 'owner' LIMIT 1"
  );

  if (existingOwners?.[0]?.id) {
    console.log('Owner already exists. Nothing to do.');
    process.exit(0);
  }

  const user = await usuariosService.createUser({
    nombre,
    email,
    password,
    rol: 'owner',
  });

  console.log(`Owner created: id=${user.id} email=${user.email}`);
  console.log('You can now login and create more users via /owner/users.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
