const express = require('express');
const Banco = require('../models/banco');
const EstadoCuenta = require('../models/estado_cuenta');
const MovimientoBanco = require('../models/movimiento_banco');
const ConciliacionBancaria = require('../models/conciliacion_bancaria');
const PDFDocument = require('pdfkit');

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

  // ========== REPORTES ==========

  // CSV de movimientos por estado de cuenta
  router.get('/:banco_id/estado-cuenta/:estado_id/report/movimientos.csv', async (req, res) => {
    try {
      const estado_id = req.params.estado_id;
      const movimientos = await movimientoBancoModel.obtenerPorEstadoCuenta(estado_id);

      let csv = 'Fecha,Concepto,Descripcion,Referencia,Tipo,Monto,Conciliado\n';
      for (const m of movimientos) {
        const fecha = new Date(m.fecha).toISOString().split('T')[0];
        const concepto = (m.concepto || '').replace(/\r?\n|,/g, ' ');
        const descripcion = (m.descripcion || '').replace(/\r?\n|,/g, ' ');
        const referencia = (m.referencia || '').replace(/\r?\n|,/g, ' ');
        const tipo = m.tipo || '';
        const monto = parseFloat(m.monto || 0).toFixed(2);
        const conciliado = m.conciliado ? 'Sí' : 'No';
        csv += `${fecha},${concepto},${descripcion},${referencia},${tipo},${monto},${conciliado}\n`;
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="movimientos_estado_${estado_id}.csv"`);
      res.send(csv);
    } catch (err) {
      res.status(500).send('Error generando CSV: ' + err.message);
    }
  });

  // Vista imprimible de conciliación (HTML listo para imprimir)
  router.get('/:banco_id/conciliacion/report', async (req, res) => {
    try {
      const banco = await bancoModel.obtenerPorId(req.params.banco_id);
      const conciliaciones = await conciliacionModel.obtenerPorBanco(req.params.banco_id);
      const movimientos_sin_conciliar = await movimientoBancoModel.obtenerPorBanco(req.params.banco_id);
      // Renderizar misma vista pero con modo printable
      res.render('banking/conciliacion', { banco, conciliaciones, movimientos_sin_conciliar, printable: true });
    } catch (err) {
      res.status(500).send('Error generando reporte: ' + err.message);
    }
  });
  // PDF: Movimientos por estado de cuenta (generado con PDFKit)
  router.get('/:banco_id/estado-cuenta/:estado_id/report/movimientos.pdf', async (req, res) => {
    try {
      const estado_id = req.params.estado_id;
      const banco_id = req.params.banco_id;
      const banco = await bancoModel.obtenerPorId(banco_id);
      const estado_cuenta = await estadoCuentaModel.obtenerPorId(estado_id);
      const movimientos = await movimientoBancoModel.obtenerPorEstadoCuenta(estado_id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="movimientos_estado_${estado_id}.pdf"`);

      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      doc.pipe(res);

      doc.fontSize(18).text(`Movimientos - ${banco ? banco.nombre : ''}`, { align: 'left' });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Estado: ${estado_cuenta ? estado_cuenta.numero_referencia : ''}`);
      doc.text(`Período: ${estado_cuenta ? new Date(estado_cuenta.fecha_desde).toLocaleDateString('es-CO') + ' - ' + new Date(estado_cuenta.fecha_hasta).toLocaleDateString('es-CO') : ''}`);
      doc.moveDown(0.5);

      // Table header
      doc.fontSize(10);
      const tableTop = doc.y + 10;
      doc.text('Fecha', 40, tableTop, { width: 70, continued: true });
      doc.text('Concepto', 120, tableTop, { width: 150, continued: true });
      doc.text('Referencia', 280, tableTop, { width: 80, continued: true });
      doc.text('Tipo', 370, tableTop, { width: 60, continued: true });
      doc.text('Monto', 430, tableTop, { width: 80, align: 'right' });
      doc.moveDown(0.5);

      // Rows
      movimientos.forEach(m => {
        const y = doc.y;
        doc.fontSize(10).text(new Date(m.fecha).toLocaleDateString('es-CO'), 40, y, { width: 70, continued: true });
        doc.text((m.concepto || '').toString(), 120, y, { width: 150, continued: true });
        doc.text((m.referencia || '').toString(), 280, y, { width: 80, continued: true });
        doc.text((m.tipo || '').toString(), 370, y, { width: 60, continued: true });
        doc.text((parseFloat(m.monto || 0).toFixed(2)), 430, y, { width: 80, align: 'right' });
        doc.moveDown(0.5);
      });

      doc.end();
    } catch (err) {
      res.status(500).send('Error generando PDF: ' + err.message);
    }
  });

  // PDF: Conciliación (generado con PDFKit)
  router.get('/:banco_id/conciliacion/report.pdf', async (req, res) => {
    try {
      const banco_id = req.params.banco_id;
      const banco = await bancoModel.obtenerPorId(banco_id);
      const conciliaciones = await conciliacionModel.obtenerPorBanco(banco_id);
      const movimientos_sin_conciliar = await movimientoBancoModel.obtenerPorBanco(banco_id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="conciliacion_banco_${banco_id}.pdf"`);

      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      doc.pipe(res);

      doc.fontSize(18).text(`Conciliación - ${banco ? banco.nombre : ''}`, { align: 'left' });
      doc.moveDown(0.5);

      doc.fontSize(12).text('Conciliaciones recientes:');
      conciliaciones.forEach(c => {
        doc.fontSize(10).text(`- ${new Date(c.fecha_conciliacion).toLocaleDateString('es-CO')} | Diferencia: $${Math.abs(c.diferencia).toFixed(2)} | Estado: ${c.estado}`);
      });

      doc.moveDown(1);
      doc.fontSize(12).text('Movimientos sin conciliar:');
      movimientos_sin_conciliar.forEach(m => {
        doc.fontSize(10).text(`- ${new Date(m.fecha).toLocaleDateString('es-CO')} | ${m.concepto} | ${m.referencia} | ${m.tipo} | $${parseFloat(m.monto).toFixed(2)}`);
      });

      doc.end();
    } catch (err) {
      res.status(500).send('Error generando PDF: ' + err.message);
    }
  });

  return router;
};
