// Modelo de Asiento Contable
function AsientoModel(db) {
  return {
    async crear({ fecha, descripcion, referencia, usuario_id, lineas }) {
      try {
        // Obtener siguiente número de asiento
        const res = await db.get(`SELECT MAX(numero_asiento) as max FROM asientos`);
        const numero_asiento = (res.max || 0) + 1;

        // Crear asiento
        const result = await db.run(
          `INSERT INTO asientos (numero_asiento, fecha, descripcion, referencia, usuario_id) VALUES (?, ?, ?, ?, ?)`,
          [numero_asiento, fecha, descripcion, referencia, usuario_id]
        );
        const asiento_id = result.lastID;

        // Insertar líneas y validar debe = haber
        let totalDebe = 0;
        let totalHaber = 0;

        for (const linea of lineas) {
          await db.run(
            `INSERT INTO lineas_asiento (asiento_id, cuenta_id, debe, haber, descripcion) VALUES (?, ?, ?, ?, ?)`,
            [asiento_id, linea.cuenta_id, linea.debe || 0, linea.haber || 0, linea.descripcion]
          );
          totalDebe += linea.debe || 0;
          totalHaber += linea.haber || 0;
        }

        // Validar partida doble
        if (Math.abs(totalDebe - totalHaber) > 0.01) {
          throw new Error('Asiento desequilibrado: debe ≠ haber');
        }

        return { id: asiento_id, numero_asiento, fecha, descripcion };
      } catch (err) {
        throw new Error(`Error creando asiento: ${err.message}`);
      }
    },

    async obtenerTodos() {
      return db.all(`SELECT * FROM asientos ORDER BY numero_asiento DESC`);
    },

    async obtenerPorId(id) {
      const asiento = await db.get(`SELECT * FROM asientos WHERE id = ?`, [id]);
      if (!asiento) return null;

      const lineas = await db.all(
        `SELECT la.*, c.codigo, c.nombre FROM lineas_asiento la
         JOIN cuentas c ON la.cuenta_id = c.id
         WHERE la.asiento_id = ?`,
        [id]
      );

      return { ...asiento, lineas };
    },

    async obtenerPorFecha(fecha_inicio, fecha_fin) {
      return db.all(
        `SELECT * FROM asientos WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC`,
        [fecha_inicio, fecha_fin]
      );
    },

    async eliminar(id) {
      // Cambiar estado a anulado (soft delete)
      await db.run(`UPDATE asientos SET estado = 'anulado' WHERE id = ?`, [id]);
    }
  };
}

module.exports = AsientoModel;
