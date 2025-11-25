// Modelo de Transacción (movimientos deuda/crédito)
function TransaccionModel(db) {
  return {
    async crear({ asiento_id, cuenta_id, tipo, monto, fecha, descripcion }) {
      try {
        const res = await db.run(
          `INSERT INTO transacciones (asiento_id, cuenta_id, tipo, monto, fecha, descripcion)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [asiento_id, cuenta_id, tipo, monto, fecha, descripcion]
        );
        return { id: res.lastID, asiento_id, cuenta_id, tipo, monto, fecha };
      } catch (err) {
        throw new Error(`Error creando transacción: ${err.message}`);
      }
    },

    async obtenerPorCuenta(cuenta_id, fecha_inicio, fecha_fin) {
      return db.all(
        `SELECT t.*, a.numero_asiento, a.descripcion as asiento_desc
         FROM transacciones t
         JOIN asientos a ON t.asiento_id = a.id
         WHERE t.cuenta_id = ? AND t.fecha BETWEEN ? AND ?
         ORDER BY t.fecha DESC`,
        [cuenta_id, fecha_inicio, fecha_fin]
      );
    },

    async obtenerSaldoCuenta(cuenta_id) {
      const res = await db.get(
        `SELECT 
          SUM(CASE WHEN tipo = 'debe' THEN monto ELSE 0 END) as total_debe,
          SUM(CASE WHEN tipo = 'haber' THEN monto ELSE 0 END) as total_haber
         FROM transacciones WHERE cuenta_id = ?`,
        [cuenta_id]
      );
      return {
        debe: res.total_debe || 0,
        haber: res.total_haber || 0,
        neto: (res.total_debe || 0) - (res.total_haber || 0)
      };
    },

    async obtenerSaldos() {
      return db.all(
        `SELECT c.id, c.codigo, c.nombre, c.tipo,
                SUM(CASE WHEN t.tipo = 'debe' THEN t.monto ELSE 0 END) as total_debe,
                SUM(CASE WHEN t.tipo = 'haber' THEN t.monto ELSE 0 END) as total_haber
         FROM cuentas c
         LEFT JOIN transacciones t ON c.id = t.cuenta_id
         WHERE c.estado = 'activa'
         GROUP BY c.id, c.codigo, c.nombre, c.tipo
         ORDER BY c.codigo`
      );
    }
  };
}

module.exports = TransaccionModel;
