const express = require('express');
const router = express.Router();

module.exports = (db, CuentaModel, AsientoModel, TransaccionModel) => {
  const Cuenta = CuentaModel(db);
  const Asiento = AsientoModel(db);
  const Transaccion = TransaccionModel(db);

  // ========== CUENTAS ==========

  // Listar cuentas
  router.get('/cuentas', async (req, res) => {
    try {
      const cuentas = await Cuenta.obtenerTodas();
      res.render('accounting/cuentas', { cuentas, error: null });
    } catch (err) {
      res.render('accounting/cuentas', { cuentas: [], error: err.message });
    }
  });

  // Crear cuenta (GET - formulario)
  router.get('/cuentas/crear', (req, res) => {
    res.render('accounting/crear-cuenta', { error: null });
  });

  // Crear cuenta (POST)
  router.post('/cuentas', async (req, res) => {
    const { codigo, nombre, tipo, clase } = req.body;
    try {
      await Cuenta.crear({ codigo, nombre, tipo, clase });
      res.redirect('/accounting/cuentas');
    } catch (err) {
      res.render('accounting/crear-cuenta', { error: err.message });
    }
  });

  // ========== ASIENTOS ==========

  // Listar asientos
  router.get('/asientos', async (req, res) => {
    try {
      const asientos = await Asiento.obtenerTodos();
      res.render('accounting/asientos', { asientos, error: null });
    } catch (err) {
      res.render('accounting/asientos', { asientos: [], error: err.message });
    }
  });

  // Crear asiento (GET - formulario)
  router.get('/asientos/crear', async (req, res) => {
    try {
      const cuentas = await Cuenta.obtenerTodas();
      res.render('accounting/crear-asiento', { cuentas, error: null });
    } catch (err) {
      res.render('accounting/crear-asiento', { cuentas: [], error: err.message });
    }
  });

  // Crear asiento (POST)
  router.post('/asientos', async (req, res) => {
    const { fecha, descripcion, referencia, lineas_json } = req.body;
    try {
      const lineas = JSON.parse(lineas_json || '[]');
      if (lineas.length < 2) throw new Error('Mínimo 2 líneas por asiento');

      const usuario_id = req.session?.userId || 1; // Usar sesión si está disponible
      await Asiento.crear({ fecha, descripcion, referencia, usuario_id, lineas });
      res.redirect('/accounting/asientos');
    } catch (err) {
      const cuentas = await Cuenta.obtenerTodas();
      res.render('accounting/crear-asiento', { cuentas, error: err.message });
    }
  });

  // Ver asiento
  router.get('/asientos/:id', async (req, res) => {
    try {
      const asiento = await Asiento.obtenerPorId(req.params.id);
      if (!asiento) return res.status(404).send('Asiento no encontrado');
      res.render('accounting/ver-asiento', { asiento });
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  // ========== DIARIO (Libro Diario) ==========

  router.get('/diario', async (req, res) => {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      const hoy = new Date().toISOString().split('T')[0];
      const f_inicio = fecha_inicio || '2025-01-01';
      const f_fin = fecha_fin || hoy;

      const asientos = await Asiento.obtenerPorFecha(f_inicio, f_fin);
      res.render('accounting/diario', { asientos, fecha_inicio: f_inicio, fecha_fin: f_fin });
    } catch (err) {
      const hoy = new Date().toISOString().split('T')[0];
      res.render('accounting/diario', { asientos: [], fecha_inicio: '2025-01-01', fecha_fin: hoy, error: err.message });
    }
  });

  // ========== MAYOR (Libro Mayor) ==========

  router.get('/mayor', async (req, res) => {
    try {
      const cuentas = await Cuenta.obtenerTodas();
      res.render('accounting/mayor', { cuentas, cuenta_id: null, movimientos: [] });
    } catch (err) {
      res.render('accounting/mayor', { cuentas: [], error: err.message });
    }
  });

  router.get('/mayor/:cuenta_id', async (req, res) => {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      const hoy = new Date().toISOString().split('T')[0];
      const f_inicio = fecha_inicio || '2025-01-01';
      const f_fin = fecha_fin || hoy;

      const cuentas = await Cuenta.obtenerTodas();
      const cuenta = await Cuenta.obtenerPorId(req.params.cuenta_id);
      const movimientos = await Transaccion.obtenerPorCuenta(req.params.cuenta_id, f_inicio, f_fin);
      const saldo = await Transaccion.obtenerSaldoCuenta(req.params.cuenta_id);

      res.render('accounting/mayor', { cuentas, cuenta_id: req.params.cuenta_id, cuenta, movimientos, saldo });
    } catch (err) {
      res.render('accounting/mayor', { cuentas: [], error: err.message });
    }
  });

  // ========== BALANCE DE PRUEBA ==========

  router.get('/balance', async (req, res) => {
    try {
      const saldos = await Transaccion.obtenerSaldos();

      let totalDebe = 0, totalHaber = 0;
      saldos.forEach(s => {
        totalDebe += s.total_debe || 0;
        totalHaber += s.total_haber || 0;
      });

      res.render('accounting/balance', { saldos, totalDebe, totalHaber });
    } catch (err) {
      res.render('accounting/balance', { saldos: [], error: err.message });
    }
  });

  // ========== ESTADO DE RESULTADOS ==========

  router.get('/resultados', async (req, res) => {
    try {
      const saldos = await Transaccion.obtenerSaldos();

      // Filtrar por tipo de cuenta
      const ingresos = saldos.filter(s => s.tipo === 'ingreso');
      const gastos = saldos.filter(s => s.tipo === 'gasto');
      const costos = saldos.filter(s => s.tipo === 'costo');

      let totalIngresos = 0, totalGastos = 0, totalCostos = 0;
      ingresos.forEach(i => totalIngresos += i.total_haber || 0);
      gastos.forEach(g => totalGastos += g.total_debe || 0);
      costos.forEach(c => totalCostos += c.total_debe || 0);

      const utilidad = totalIngresos - totalGastos - totalCostos;

      res.render('accounting/resultados', { ingresos, gastos, costos, totalIngresos, totalGastos, totalCostos, utilidad });
    } catch (err) {
      res.render('accounting/resultados', { ingresos: [], gastos: [], costos: [], totalIngresos: 0, totalGastos: 0, totalCostos: 0, utilidad: 0, error: err.message });
    }
  });

  return router;
};
