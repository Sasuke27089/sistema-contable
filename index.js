  const bankingRoutes = require('./routes/banking')(db);
  app.use('/banking', bankingRoutes);
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const bodyParser = require('express').urlencoded;

require('dotenv').config();
const { init } = require('./db');
const UserModel = require('./models/user');
const CuentaModel = require('./models/cuenta');
const AsientoModel = require('./models/asiento');
const TransaccionModel = require('./models/transaccion');
const createAIClient = require('./services/aiClient');


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

  // Exponer sesión a las vistas
  app.use((req, res, next) => {
    res.locals.session = req.session || {};
    next();
  });

  const User = UserModel(db);
  const Cuenta = CuentaModel(db);
  const Asiento = AsientoModel(db);
  const Transaccion = TransaccionModel(db);

  const authRoutes = require('./routes/auth')(db, User);
  const userRoutes = require('./routes/users')(db, User);
  const aiRoutes = require('./routes/ai')(createAIClient);
  const accountingRoutes = require('./routes/accounting')(db, CuentaModel, AsientoModel, TransaccionModel);

  app.use(authRoutes);
  app.use(userRoutes);
  app.use(aiRoutes);
  app.use('/accounting', accountingRoutes);

  // start server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor listo en http://localhost:${PORT}`);
  });
})();
