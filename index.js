const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const bodyParser = require('express').urlencoded;

const { init } = require('./db');
const UserModel = require('./models/user');

(async () => {
  const db = await init();
  const app = express();

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(bodyParser({ extended: false }));

  app.use(
    session({
      store: new SQLiteStore({ db: 'sessions.sqlite3', dir: path.join(__dirname, 'data') }),
      secret: 'cambio-esta-secreto',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 24 * 60 * 60 * 1000 }
    })
  );

  const User = UserModel(db);

  const authRoutes = require('./routes/auth')(db, User);
  const userRoutes = require('./routes/users')(db, User);

  app.use(authRoutes);
  app.use(userRoutes);

  // start server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor listo en http://localhost:${PORT}`);
  });
})();
