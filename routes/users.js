const express = require('express');
const router = express.Router();

// Autenticación saltada: rutas accesibles sin iniciar sesión
module.exports = (db, User) => {
  router.get('/dashboard', async (req, res) => {
    const userName = (req.session && req.session.userName) ? req.session.userName : 'Invitado';
    res.render('dashboard', { userName });
  });

  router.get('/users', async (req, res) => {
    const users = await User.getAll();
    res.render('users', { users });
  });

  return router;
};
