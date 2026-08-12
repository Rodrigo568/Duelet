class Task {
    constructor({
        id,
        userId,
        subjectId,
        title,
        description,
        type,
        deadline,
        estimatedEffortMinutes,
        estimationMethod,
        estimationMetadata,
        priority,
        status,
        createdAt,
        updatedAt,
    }) {
        this.id = id;
        this.userId = userId;
        this.subjectId = subjectId;
        this.title = title;
        this.description = description;
        this.type = type;
        this.deadline = deadline;
        this.estimatedEffortMinutes = estimatedEffortMinutes;
        this.estimationMethod = estimationMethod;
        this.estimationMetadata = estimationMetadata;
        this.priority = priority;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            subjectId: this.subjectId,
            title: this.title,
            description: this.description,
            type: this.type,
            deadline: this.deadline,
            estimatedEffortMinutes: this.estimatedEffortMinutes,
            estimationMethod: this.estimationMethod,
            estimationMetadata: this.estimationMetadata,
            priority: this.priority,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}

export default Task;
