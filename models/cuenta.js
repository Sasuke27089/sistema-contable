// Modelo de Cuenta
function CuentaModel(db) {
  return {
    async crear({ codigo, nombre, tipo, clase }) {
      try {
        const res = await db.run(
          `INSERT INTO cuentas (codigo, nombre, tipo, clase) VALUES (?, ?, ?, ?)`,
          [codigo, nombre, tipo, clase]
        );
        return { id: res.lastID, codigo, nombre, tipo, clase };
      } catch (err) {
        throw new Error(`Error creando cuenta: ${err.message}`);
      }
    },

    async obtenerTodas() {
      return db.all(`SELECT * FROM cuentas WHERE estado = 'activa' ORDER BY codigo`);
    },

    async obtenerPorId(id) {
      return db.get(`SELECT * FROM cuentas WHERE id = ?`, [id]);
    },

    async obtenerPorCodigo(codigo) {
      return db.get(`SELECT * FROM cuentas WHERE codigo = ?`, [codigo]);
    },

    async actualizar(id, { nombre, tipo, clase, estado }) {
      await db.run(
        `UPDATE cuentas SET nombre = ?, tipo = ?, clase = ?, estado = ? WHERE id = ?`,
        [nombre, tipo, clase, estado, id]
      );
      return this.obtenerPorId(id);
    },

    async actualizarSaldo(id, debe, haber) {
      await db.run(
        `UPDATE cuentas SET saldo_deudor = saldo_deudor + ?, saldo_acreedor = saldo_acreedor + ? WHERE id = ?`,
        [debe, haber, id]
      );
    },

    async eliminar(id) {
      await db.run(`UPDATE cuentas SET estado = 'inactiva' WHERE id = ?`, [id]);
    }
  };
}

module.exports = CuentaModel;
