import Subject from "../models/Subject.js";

class SubjectRepository {
    constructor(db) {
        this.db = db;
    }

    toModel(row) {
        if (!row) {
            return null;
        }

        return new Subject({
            id: row.id,
            userId: row.user_id,
            name: row.name,
            color: row.color,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        });
    }

    async create(subject) {
        const sql = `
            INSERT INTO subjects (
                user_id,
                name,
                color
            )
            VALUES (?, ?, ?)
        `;

        const [result] = await this.db.execute(sql, [subject.userId, subject.name, subject.color]);

        return await this.findById(result.insertId, subject.userId);
    }

    async findById(id, userId) {
        const sql = `
            SELECT *
            FROM subjects
            WHERE id = ?
              AND user_id = ?
        `;

        const [rows] = await this.db.execute(sql, [id, userId]);

        return this.toModel(rows[0]);
    }

    async findAllByUserId(userId) {
        const sql = `
            SELECT *
            FROM subjects
            WHERE user_id = ?
            ORDER BY name ASC
        `;

        const [rows] = await this.db.execute(sql, [userId]);

        return rows.map((row) => this.toModel(row));
    }

    async update(subject) {
        const sql = `
            UPDATE subjects
            SET name = ?, color = ?
            WHERE id = ?
              AND user_id = ?
        `;

        await this.db.execute(sql, [subject.name, subject.color, subject.id, subject.userId]);

        return await this.findById(subject.id, subject.userId);
    }

    async deleteById(id, userId) {
        const sql = `
            DELETE FROM subjects
            WHERE id = ?
              AND user_id = ?
        `;

        const [result] = await this.db.execute(sql, [id, userId]);

        return result.affectedRows > 0;
    }
}

export default SubjectRepository;
