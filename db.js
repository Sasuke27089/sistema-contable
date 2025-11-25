const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function init() {
  const db = await open({
    filename: path.join(__dirname, 'data', 'database.sqlite3'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cuentas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT UNIQUE NOT NULL,
      nombre TEXT NOT NULL,
      tipo TEXT NOT NULL,
      clase TEXT,
      saldo_deudor REAL DEFAULT 0,
      saldo_acreedor REAL DEFAULT 0,
      estado TEXT DEFAULT 'activa',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS asientos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_asiento INTEGER UNIQUE NOT NULL,
      fecha DATE NOT NULL,
      descripcion TEXT,
      referencia TEXT,
      estado TEXT DEFAULT 'registrado',
      usuario_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS lineas_asiento (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asiento_id INTEGER NOT NULL,
      cuenta_id INTEGER NOT NULL,
      debe REAL DEFAULT 0,
      haber REAL DEFAULT 0,
      descripcion TEXT,
      FOREIGN KEY (asiento_id) REFERENCES asientos(id) ON DELETE CASCADE,
      FOREIGN KEY (cuenta_id) REFERENCES cuentas(id)
    );

    CREATE TABLE IF NOT EXISTS transacciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asiento_id INTEGER NOT NULL,
      cuenta_id INTEGER NOT NULL,
      tipo TEXT,
      monto REAL NOT NULL,
      fecha DATE NOT NULL,
      descripcion TEXT,
      FOREIGN KEY (asiento_id) REFERENCES asientos(id) ON DELETE CASCADE,
      FOREIGN KEY (cuenta_id) REFERENCES cuentas(id)
    );

    CREATE TABLE IF NOT EXISTS bancos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      codigo_banco TEXT UNIQUE NOT NULL,
      cuenta_bancaria TEXT UNIQUE NOT NULL,
      tipo_cuenta TEXT,
      saldo_inicial REAL DEFAULT 0,
      saldo_actual REAL DEFAULT 0,
      estado TEXT DEFAULT 'activo',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS estados_cuenta (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      banco_id INTEGER NOT NULL,
      numero_referencia TEXT UNIQUE,
      fecha_desde DATE,
      fecha_hasta DATE,
      saldo_inicial REAL,
      saldo_final REAL,
      total_depositos REAL DEFAULT 0,
      total_retiros REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (banco_id) REFERENCES bancos(id)
    );

    CREATE TABLE IF NOT EXISTS movimientos_banco (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      estado_cuenta_id INTEGER NOT NULL,
      banco_id INTEGER NOT NULL,
      fecha DATE NOT NULL,
      concepto TEXT,
      descripcion TEXT,
      referencia TEXT,
      tipo TEXT,
      monto REAL NOT NULL,
      saldo REAL,
      conciliado BOOLEAN DEFAULT 0,
      asiento_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (estado_cuenta_id) REFERENCES estados_cuenta(id) ON DELETE CASCADE,
      FOREIGN KEY (banco_id) REFERENCES bancos(id),
      FOREIGN KEY (asiento_id) REFERENCES asientos(id)
    );

    CREATE TABLE IF NOT EXISTS conciliaciones_bancarias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      banco_id INTEGER NOT NULL,
      fecha_conciliacion DATE,
      saldo_libro REAL,
      saldo_banco REAL,
      diferencia REAL,
      estado TEXT DEFAULT 'en_proceso',
      notas TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (banco_id) REFERENCES bancos(id)
    );
  `);

  return db;
}

module.exports = { init };
