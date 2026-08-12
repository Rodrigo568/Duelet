import Availability from "../models/Availability.js";

class AvailabilityRepository {
    constructor(db) {
        this.db = db;
    }

    toModel(row) {
        if (!row) {
            return null;
        }

        return new Availability({
            id: row.id,
            userId: row.user_id,
            dayOfWeek: row.day_of_week,
            startTime: row.start_time,
            endTime: row.end_time,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        });
    }

    async create(availability) {
        const sql = `
            INSERT INTO availabilities (
                user_id,
                day_of_week,
                start_time,
                end_time
            )
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await this.db.execute(sql, [
            availability.userId,
            availability.dayOfWeek,
            availability.startTime,
            availability.endTime,
        ]);

        return await this.findById(result.insertId, availability.userId);
    }

    async findAllByUserId(userId) {
        const sql = `
            SELECT *
            FROM availabilities
            WHERE user_id = ?
            ORDER BY day_of_week ASC, start_time ASC
        `;

        const [rows] = await this.db.execute(sql, [userId]);

        return rows.map((row) => this.toModel(row));
    }

    async update(availability) {
        const sql = `
            UPDATE availabilities
            SET day_of_week = ?,
                start_time = ?,
                end_time = ?
            WHERE id = ?
              AND user_id = ?
        `;

        await this.db.execute(sql, [
            availability.dayOfWeek,
            availability.startTime,
            availability.endTime,
            availability.id,
            availability.userId,
        ]);

        return await this.findById(availability.id, availability.userId);
    }
    async deleteById(id, userId) {
        const sql = `
            DELETE FROM availabilities
            WHERE id = ?
              AND user_id = ?
        `;

        const [result] = await this.db.execute(sql, [id, userId]);

        return result.affectedRows > 0;
    }
}
export default AvailabilityRepository;
