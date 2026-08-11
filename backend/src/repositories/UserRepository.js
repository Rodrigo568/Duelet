class UserRepository {
    constructor(db) {
        this.db = db;
    }

    async create(user) {
        const sql = `
            INSERT INTO users (
                name,
                email,
                password_hash,
                timezone
            )
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await this.db.execute(sql, [
            user.name,
            user.email,
            user.passwordHash,
            user.timezone,
        ]);

        return result;
    }

    async findById(id) {
        const sql = `
            SELECT *
            FROM users
            WHERE id = ?
        `;

        const [rows] = await this.db.execute(sql, [id]);

        if (rows.length === 0) {
            return null;
        }

        return rows[0];
    }

    async findByEmail(email) {
        const sql = `
            SELECT *
            FROM users
            WHERE email = ?
        `;

        const [rows] = await this.db.execute(sql, [email]);

        if (rows.length === 0) {
            return null;
        }

        return rows[0];
    }

    async update(id, user) {
        // TODO
    }

    async delete(id) {
        const sql = `
            DELETE FROM users
            WHERE id = ?
        `;

        const [result] = await this.db.execute(sql, [id]);

        return result;
    }
}

export default UserRepository;
