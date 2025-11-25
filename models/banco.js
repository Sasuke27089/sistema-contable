class Banco {
  constructor(db) {
    this.db = db;
  }

  async crear(nombre, codigo_banco, cuenta_bancaria, tipo_cuenta, saldo_inicial) {
    try {
      const result = await this.db.run(
        `INSERT INTO bancos (nombre, codigo_banco, cuenta_bancaria, tipo_cuenta, saldo_inicial, saldo_actual)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nombre, codigo_banco, cuenta_bancaria, tipo_cuenta, saldo_inicial, saldo_inicial]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async obtenerTodos() {
    try {
      return await this.db.all(`
        SELECT * FROM bancos 
        WHERE estado = 'activo'
        ORDER BY nombre
      `);
    } catch (error) {
      throw error;
    }
  }

  async obtenerPorId(id) {
    try {
      return await this.db.get(`SELECT * FROM bancos WHERE id = ?`, [id]);
    } catch (error) {
      throw error;
    }
  }

  async actualizar(id, nombre, tipo_cuenta, estado) {
    try {
      return await this.db.run(
        `UPDATE bancos SET nombre = ?, tipo_cuenta = ?, estado = ? WHERE id = ?`,
        [nombre, tipo_cuenta, estado, id]
      );
    } catch (error) {
      throw error;
    }
  }

  async actualizarSaldo(id, saldo) {
    try {
      return await this.db.run(
        `UPDATE bancos SET saldo_actual = ? WHERE id = ?`,
        [saldo, id]
      );
    } catch (error) {
      throw error;
    }
  }

  async eliminar(id) {
    try {
      return await this.db.run(`DELETE FROM bancos WHERE id = ?`, [id]);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Banco;
