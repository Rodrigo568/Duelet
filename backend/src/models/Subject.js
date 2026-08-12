class Subject {
    constructor({ id, userId, name, color, createdAt, updatedAt }) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.color = color;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            name: this.name,
            color: this.color,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}

export default Subject;
