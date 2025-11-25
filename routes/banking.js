const express = require('express');
const Banco = require('../models/banco');
const EstadoCuenta = require('../models/estado_cuenta');
const MovimientoBanco = require('../models/movimiento_banco');
const ConciliacionBancaria = require('../models/conciliacion_bancaria');

module.exports = function(db) {
  const router = express.Router();
  
  const bancoModel = new Banco(db);
  const estadoCuentaModel = new EstadoCuenta(db);
  const movimientoBancoModel = new MovimientoBanco(db);
  const conciliacionModel = new ConciliacionBancaria(db);

  // ========== BANCOS ==========

  router.get('/', async (req, res) => {
    try {
      const bancos = await bancoModel.obtenerTodos();
      res.render('banking/bancos', { bancos });
    } catch (err) {
      res.render('banking/bancos', { bancos: [], error: err.message });
    }
  });

  router.get('/crear', (req, res) => {
    res.render('banking/crear-banco');
  });

  router.post('/', async (req, res) => {
    try {
      const { nombre, codigo_banco, cuenta_bancaria, tipo_cuenta, saldo_inicial } = req.body;
      await bancoModel.crear(nombre, codigo_banco, cuenta_bancaria, tipo_cuenta, saldo_inicial);
      res.redirect('/banking');
    } catch (err) {
      res.render('banking/crear-banco', { error: err.message });
    }
  });

  router.get('/:banco_id', async (req, res) => {
    try {
      const banco = await bancoModel.obtenerPorId(req.params.banco_id);
      const estados_cuenta = await estadoCuentaModel.obtenerPorBanco(req.params.banco_id);
      res.render('banking/detalle-banco', { banco, estados_cuenta });
    } catch (err) {
      res.render('banking/detalle-banco', { error: err.message });
    }
  });

  // ========== ESTADOS DE CUENTA ==========

  router.get('/:banco_id/estado-cuenta/crear', async (req, res) => {
    try {
      const banco = await bancoModel.obtenerPorId(req.params.banco_id);
      res.render('banking/crear-estado-cuenta', { banco });
    } catch (err) {
      res.render('banking/crear-estado-cuenta', { error: err.message });
    }
  });

  router.post('/:banco_id/estado-cuenta', async (req, res) => {
    try {
      const { numero_referencia, fecha_desde, fecha_hasta, saldo_inicial, saldo_final } = req.body;
      const banco_id = req.params.banco_id;
      
      const result = await estadoCuentaModel.crear(
        banco_id, numero_referencia, fecha_desde, fecha_hasta, saldo_inicial, saldo_final
      );
      
      res.redirect(`/banking/${banco_id}/estado-cuenta/${result.lastID}/importar`);
    } catch (err) {
      res.render('banking/crear-estado-cuenta', { error: err.message });
    }
  });

  router.get('/:banco_id/estado-cuenta/:estado_id', async (req, res) => {
    try {
      const banco = await bancoModel.obtenerPorId(req.params.banco_id);
      const estado_cuenta = await estadoCuentaModel.obtenerPorId(req.params.estado_id);
      const movimientos = await movimientoBancoModel.obtenerPorEstadoCuenta(req.params.estado_id);
      
      res.render('banking/detalle-estado-cuenta', { banco, estado_cuenta, movimientos });
    } catch (err) {
      res.render('banking/detalle-estado-cuenta', { error: err.message });
    }
  });

  // ========== IMPORTAR MOVIMIENTOS ==========

  router.get('/:banco_id/estado-cuenta/:estado_id/importar', async (req, res) => {
    try {
      const banco = await bancoModel.obtenerPorId(req.params.banco_id);
      const estado_cuenta = await estadoCuentaModel.obtenerPorId(req.params.estado_id);
      res.render('banking/importar-movimientos', { banco, estado_cuenta });
    } catch (err) {
      res.render('banking/importar-movimientos', { error: err.message });
    }
  });

  router.post('/:banco_id/estado-cuenta/:estado_id/importar-csv', async (req, res) => {
    try {
      const { movimientos_csv } = req.body;
      const estado_id = req.params.estado_id;
      const banco_id = req.params.banco_id;

      // Procesar CSV
      const lineas = movimientos_csv.trim().split('\n');
      let total_depositos = 0;
      let total_retiros = 0;
      let count = 0;

      for (const linea of lineas) {
        if (!linea.trim()) continue;
        
        const [fecha, concepto, descripcion, referencia, tipo, monto_str] = linea.split('|');
        const monto = parseFloat(monto_str) || 0;

        if (tipo === 'deposito') {
          total_depositos += monto;
        } else if (tipo === 'retiro') {
          total_retiros += monto;
        }

        await movimientoBancoModel.crear(
          estado_id, banco_id, fecha, concepto, descripcion, referencia, tipo, monto, null
        );
        count++;
      }

      await estadoCuentaModel.actualizarTotales(estado_id, total_depositos, total_retiros);

      res.json({ 
        success: true, 
        message: `Se importaron ${count} movimientos`,
        redirect: `/banking/${banco_id}/estado-cuenta/${estado_id}`
      });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  // ========== CONCILIACIÓN BANCARIA ==========

  router.get('/:banco_id/conciliacion', async (req, res) => {
    try {
      const banco = await bancoModel.obtenerPorId(req.params.banco_id);
      const conciliaciones = await conciliacionModel.obtenerPorBanco(req.params.banco_id);
      const movimientos_sin_conciliar = await movimientoBancoModel.obtenerPorBanco(req.params.banco_id);
      
      res.render('banking/conciliacion', { banco, conciliaciones, movimientos_sin_conciliar });
    } catch (err) {
      res.render('banking/conciliacion', { error: err.message });
    }
  });

  router.post('/:banco_id/conciliacion', async (req, res) => {
    try {
      const { saldo_libro, saldo_banco } = req.body;
      const banco_id = req.params.banco_id;
      const fecha_conciliacion = new Date().toISOString().split('T')[0];
      const diferencia = Math.abs(parseFloat(saldo_libro) - parseFloat(saldo_banco));
      const estado = diferencia < 0.01 ? 'conciliada' : 'pendiente';

      const result = await conciliacionModel.crear(
        banco_id, fecha_conciliacion, saldo_libro, saldo_banco, diferencia, estado
      );

      res.json({ 
        success: true, 
        message: estado === 'conciliada' ? 'Conciliación completada' : 'Conciliación con diferencia',
        estado,
        diferencia,
        conciliacion_id: result.lastID
      });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  router.post('/:banco_id/conciliar-movimiento/:movimiento_id', async (req, res) => {
    try {
      const { asiento_id } = req.body;
      await movimientoBancoModel.conciliarMovimiento(req.params.movimiento_id, asiento_id);
      res.json({ success: true });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  router.post('/:banco_id/desconciliar-movimiento/:movimiento_id', async (req, res) => {
    try {
      await movimientoBancoModel.desconciliarMovimiento(req.params.movimiento_id);
      res.json({ success: true });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  return router;
};
