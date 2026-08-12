import db from "./database/connection.js";

// Auth
import AuthService from "./services/AuthService.js";
import AuthController from "./controllers/AuthController.js";

// User
import UserRepository from "./repositories/UserRepository.js";
import UserService from "./services/UserService.js";
import UserController from "./controllers/UserController.js";

// Subject
import SubjectRepository from "./repositories/SubjectRepository.js";
import SubjectService from "./services/SubjectService.js";
import SubjectController from "./controllers/SubjectController.js";

// Tasksss
import TaskRepository from "./repositories/TaskRepository.js";
import TaskService from "./services/TaskService.js";
import TaskController from "./controllers/TaskController.js";

// User
const userRepository = new UserRepository(db);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// Auth
const authService = new AuthService(userRepository, userService);

const authController = new AuthController(authService);

// Subject
const subjectRepository = new SubjectRepository(db);
const subjectService = new SubjectService(subjectRepository);
const subjectController = new SubjectController(subjectService);

// Task
const taskRepository = new TaskRepository(db);
const taskService = new TaskService(taskRepository);
const taskController = new TaskController(taskService);

export {
    userRepository,
    userService,
    userController,
    authService,
    authController,
    subjectRepository,
    subjectService,
    subjectController,
    taskRepository,
    taskService,
    taskController,
};
