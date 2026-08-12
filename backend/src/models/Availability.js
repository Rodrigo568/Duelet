class Availability {
    constructor({ id, userId, dayOfWeek, startTime, endTime, createdAt, updatedAt }) {
        this.id = id;
        this.userId = userId;
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            dayOfWeek: this.dayOfWeek,
            startTime: this.startTime,
            endTime: this.endTime,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}

export default Availability;
