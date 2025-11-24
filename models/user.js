const bcrypt = require('bcrypt');

function UserModel(db) {
  return {
    async createUser({ name, email, password, role = 'user' }) {
      const hash = await bcrypt.hash(password, 10);
      const res = await db.run(
        `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
        [name, email, hash, role]
      );
      return { id: res.lastID, name, email, role };
    },

    async findByEmail(email) {
      return db.get(`SELECT * FROM users WHERE email = ?`, [email]);
    },

    async findById(id) {
      return db.get(`SELECT id, name, email, role, created_at FROM users WHERE id = ?`, [id]);
    },

    async getAll() {
      return db.all(`SELECT id, name, email, role, created_at FROM users ORDER BY id DESC`);
    },

    async verifyPassword(userRow, plain) {
      if (!userRow) return false;
      return bcrypt.compare(plain, userRow.password);
    }
  };
}

module.exports = UserModel;
