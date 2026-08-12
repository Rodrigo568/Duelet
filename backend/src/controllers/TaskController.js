class TaskController {
    constructor(taskService) {
        this.taskService = taskService;
    }

    async createTask(req, res, next) {
        const task = await this.taskService.createTask(req.user.id, req.body);

        res.status(201).json({
            success: true,
            data: task,
        });
    }

    async getTaskById(req, res, next) {
        const task = await this.taskService.getTaskById(req.params.id, req.user.id);

        res.status(200).json({
            success: true,
            data: task,
        });
    }

    async getAllTasks(req, res, next) {
        const tasks = await this.taskService.getAllTasksByUserId(req.user.id);

        res.status(200).json({
            success: true,
            data: tasks,
        });
    }

    async updateTask(req, res, next) {
        const task = await this.taskService.updateTask(req.params.id, req.user.id, req.body);

        res.status(200).json({
            success: true,
            data: task,
        });
    }

    async deleteTask(req, res, next) {
        await this.taskService.deleteTask(req.params.id, req.user.id);

        res.status(204).send();
    }
}

export default TaskController;
