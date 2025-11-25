class MovimientoBanco {
  constructor(db) {
    this.db = db;
  }

  async crear(estado_cuenta_id, banco_id, fecha, concepto, descripcion, referencia, tipo, monto, saldo) {
    try {
      const result = await this.db.run(
        `INSERT INTO movimientos_banco 
         (estado_cuenta_id, banco_id, fecha, concepto, descripcion, referencia, tipo, monto, saldo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [estado_cuenta_id, banco_id, fecha, concepto, descripcion, referencia, tipo, monto, saldo]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async obtenerPorEstadoCuenta(estado_cuenta_id) {
    try {
      return await this.db.all(
        `SELECT * FROM movimientos_banco WHERE estado_cuenta_id = ? ORDER BY fecha`,
        [estado_cuenta_id]
      );
    } catch (error) {
      throw error;
    }
  }

  async obtenerPorBanco(banco_id) {
    try {
      return await this.db.all(
        `SELECT * FROM movimientos_banco WHERE banco_id = ? AND conciliado = 0 ORDER BY fecha DESC`,
        [banco_id]
      );
    } catch (error) {
      throw error;
    }
  }

  async conciliarMovimiento(id, asiento_id) {
    try {
      return await this.db.run(
        `UPDATE movimientos_banco SET conciliado = 1, asiento_id = ? WHERE id = ?`,
        [asiento_id, id]
      );
    } catch (error) {
      throw error;
    }
  }

  async desconciliarMovimiento(id) {
    try {
      return await this.db.run(
        `UPDATE movimientos_banco SET conciliado = 0, asiento_id = NULL WHERE id = ?`,
        [id]
      );
    } catch (error) {
      throw error;
    }
  }

  async eliminar(id) {
    try {
      return await this.db.run(`DELETE FROM movimientos_banco WHERE id = ?`, [id]);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MovimientoBanco;
