import User from "../models/User.js";

class UserRepository {
    constructor(db) {
        this.db = db;
    }

    toModel(row) {
        if (!row) {
            return null;
        }

        return new User({
            id: row.id,
            name: row.name,
            email: row.email,
            passwordHash: row.password_hash,
            timezone: row.timezone,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        });
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

        const [result] = await this.db.execute(sql, [user.name, user.email, user.passwordHash, user.timezone]);

        return await this.findById(result.insertId);
    }

    async findById(id) {
        const sql = `
            SELECT *
            FROM users
            WHERE id = ?
        `;

        const [rows] = await this.db.execute(sql, [id]);

        return this.toModel(rows[0]);
    }

    async findByEmail(email) {
        const sql = `
            SELECT *
            FROM users
            WHERE email = ?
        `;

        const [rows] = await this.db.execute(sql, [email]);

        return this.toModel(rows[0]);
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

        return result.affectedRows > 0;
    }
}

export default UserRepository;
