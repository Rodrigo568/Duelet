import Task from "../models/Task.js";

class TaskRepository {
    constructor(db) {
        this.db = db;
    }

    toModel(row) {
        if (!row) {
            return null;
        }

        return new Task({
            id: row.id,
            userId: row.user_id,
            subjectId: row.subject_id,
            title: row.title,
            description: row.description,
            type: row.type,
            deadline: row.deadline,
            estimatedEffortMinutes: row.estimated_effort_minutes,
            estimationMethod: row.estimation_method,
            estimationMetadata: row.estimation_metadata,
            priority: row.priority,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        });
    }

    async create(task) {
        const sql = `
            INSERT INTO tasks (
                user_id,
                subject_id,
                title,
                description,
                type,
                deadline,
                estimated_effort_minutes,
                estimation_method,
                estimation_metadata,
                priority,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await this.db.execute(sql, [
            task.userId,
            task.subjectId,
            task.title,
            task.description,
            task.type,
            task.deadline,
            task.estimatedEffortMinutes,
            task.estimationMethod,
            task.estimationMetadata === null ? null : JSON.stringify(task.estimationMetadata),
            task.priority,
            task.status,
        ]);

        return await this.findById(result.insertId, task.userId);
    }

    async findById(id, userId) {
        const sql = `
            SELECT *
            FROM tasks
            WHERE id = ?
              AND user_id = ?
        `;

        const [rows] = await this.db.execute(sql, [id, userId]);

        return this.toModel(rows[0]);
    }

    async findAllByUserId(userId) {
        const sql = `
            SELECT *
            FROM tasks
            WHERE user_id = ?
            ORDER BY deadline ASC
        `;

        const [rows] = await this.db.execute(sql, [userId]);

        return rows.map((row) => this.toModel(row));
    }

    async update(task) {
        const sql = `
            UPDATE tasks
            SET subject_id = ?,
                title = ?,
                description = ?,
                type = ?,
                deadline = ?,
                estimated_effort_minutes = ?,
                estimation_method = ?,
                estimation_metadata = ?,
                priority = ?,
                status = ?
            WHERE id = ?
              AND user_id = ?
        `;

        await this.db.execute(sql, [
            task.subjectId,
            task.title,
            task.description,
            task.type,
            task.deadline,
            task.estimatedEffortMinutes,
            task.estimationMethod,
            task.estimationMetadata === null ? null : JSON.stringify(task.estimationMetadata),
            task.priority,
            task.status,
            task.id,
            task.userId,
        ]);

        return await this.findById(task.id, task.userId);
    }

    async deleteById(id, userId) {
        const sql = `
            DELETE FROM tasks
            WHERE id = ?
              AND user_id = ?
        `;

        const [result] = await this.db.execute(sql, [id, userId]);

        return result.affectedRows > 0;
    }
}

export default TaskRepository;
