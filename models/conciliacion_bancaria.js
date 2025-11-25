class ConciliacionBancaria {
  constructor(db) {
    this.db = db;
  }

  async crear(banco_id, fecha_conciliacion, saldo_libro, saldo_banco, diferencia, estado = 'en_proceso') {
    try {
      const result = await this.db.run(
        `INSERT INTO conciliaciones_bancarias 
         (banco_id, fecha_conciliacion, saldo_libro, saldo_banco, diferencia, estado)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [banco_id, fecha_conciliacion, saldo_libro, saldo_banco, diferencia, estado]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async obtenerPorBanco(banco_id) {
    try {
      return await this.db.all(
        `SELECT * FROM conciliaciones_bancarias WHERE banco_id = ? ORDER BY fecha_conciliacion DESC`,
        [banco_id]
      );
    } catch (error) {
      throw error;
    }
  }

  async obtenerPorId(id) {
    try {
      return await this.db.get(`SELECT * FROM conciliaciones_bancarias WHERE id = ?`, [id]);
    } catch (error) {
      throw error;
    }
  }

  async actualizarEstado(id, estado, notas = '') {
    try {
      return await this.db.run(
        `UPDATE conciliaciones_bancarias SET estado = ?, notas = ? WHERE id = ?`,
        [estado, notas, id]
      );
    } catch (error) {
      throw error;
    }
  }

  async obtenerUltimaConciliacion(banco_id) {
    try {
      return await this.db.get(
        `SELECT * FROM conciliaciones_bancarias WHERE banco_id = ? ORDER BY fecha_conciliacion DESC LIMIT 1`,
        [banco_id]
      );
    } catch (error) {
      throw error;
    }
  }

  async eliminar(id) {
    try {
      return await this.db.run(`DELETE FROM conciliaciones_bancarias WHERE id = ?`, [id]);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ConciliacionBancaria;
