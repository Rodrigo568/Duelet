class SubjectController {
    constructor(subjectService) {
        this.subjectService = subjectService;
    }

    async create(req, res) {
        const subject = await this.subjectService.createSubject(req.user.id, req.body);

        res.status(201).json({
            success: true,
            data: subject,
        });
    }

    async getById(req, res) {
        const subject = await this.subjectService.getSubjectById(req.params.id, req.user.id);

        res.status(200).json({
            success: true,
            data: subject,
        });
    }

    async getAll(req, res) {
        const subjects = await this.subjectService.getAllSubjectsByUserId(req.user.id);

        res.status(200).json({
            success: true,
            data: subjects,
        });
    }

    async update(req, res) {
        const subject = await this.subjectService.updateSubject(req.params.id, req.user.id, req.body);

        res.status(200).json({
            success: true,
            data: subject,
        });
    }

    async delete(req, res) {
        await this.subjectService.deleteSubject(req.params.id, req.user.id);

        res.status(204).send();
    }
}

export default SubjectController;
