require('dotenv').config();
const path = require('path');
const { init } = require('../db');
const UserModel = require('../models/user');

(async () => {
  try {
    const db = await init();
    const User = UserModel(db);

    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin123!';
    const name = process.env.ADMIN_NAME || 'Administrador';

    const existing = await User.findByEmail(email);
    if (existing) {
      console.log(`Usuario admin ya existe: ${email} (id=${existing.id})`);
      process.exit(0);
    }

    const created = await User.createUser({ name, email, password, role: 'admin' });
    console.log('Usuario admin creado:', created);
    console.log('Por seguridad, cambie la contraseña después de acceder.');
    process.exit(0);
  } catch (err) {
    console.error('Error creando admin:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
