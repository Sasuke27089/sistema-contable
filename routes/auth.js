const express = require('express');
const router = express.Router();

function ensureLoggedOut(req, res, next) {
  if (req.session && req.session.userId) return res.redirect('/dashboard');
  next();
}

module.exports = (db, User) => {
  router.get('/', (req, res) => res.redirect('/login'));

  router.get('/login', ensureLoggedOut, (req, res) => {
    res.render('login', { error: null });
  });

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const userRow = await User.findByEmail(email);
    const ok = await User.verifyPassword(userRow, password);
    if (!ok) return res.render('login', { error: 'Correo o contraseña incorrectos' });

    req.session.userId = userRow.id;
    req.session.userName = userRow.name;
    req.session.role = userRow.role;
    res.redirect('/dashboard');
  });

  router.get('/register', ensureLoggedOut, (req, res) => {
    res.render('register', { error: null });
  });

  router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
      await User.createUser({ name, email, password });
      res.redirect('/login');
    } catch (err) {
      console.error(err);
      res.render('register', { error: 'No fue posible crear el usuario (¿email ya existe?).' });
    }
  });

  router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
  });

  return router;
};
