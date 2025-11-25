class EstadoCuenta {
  constructor(db) {
    this.db = db;
  }

  async crear(banco_id, numero_referencia, fecha_desde, fecha_hasta, saldo_inicial, saldo_final) {
    try {
      const total_depositos = 0;
      const total_retiros = 0;
      
      const result = await this.db.run(
        `INSERT INTO estados_cuenta 
         (banco_id, numero_referencia, fecha_desde, fecha_hasta, saldo_inicial, saldo_final, total_depositos, total_retiros)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [banco_id, numero_referencia, fecha_desde, fecha_hasta, saldo_inicial, saldo_final, total_depositos, total_retiros]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async obtenerPorBanco(banco_id) {
    try {
      return await this.db.all(
        `SELECT * FROM estados_cuenta WHERE banco_id = ? ORDER BY fecha_hasta DESC`,
        [banco_id]
      );
    } catch (error) {
      throw error;
    }
  }

  async obtenerPorId(id) {
    try {
      return await this.db.get(`SELECT * FROM estados_cuenta WHERE id = ?`, [id]);
    } catch (error) {
      throw error;
    }
  }

  async actualizarTotales(id, total_depositos, total_retiros) {
    try {
      return await this.db.run(
        `UPDATE estados_cuenta SET total_depositos = ?, total_retiros = ? WHERE id = ?`,
        [total_depositos, total_retiros, id]
      );
    } catch (error) {
      throw error;
    }
  }

  async eliminar(id) {
    try {
      return await this.db.run(`DELETE FROM estados_cuenta WHERE id = ?`, [id]);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = EstadoCuenta;
