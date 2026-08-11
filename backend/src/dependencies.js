import db from "./database/connection.js";

import UserRepository from "./repositories/UserRepository.js";
import UserService from "./services/UserService.js";
import UserController from "./controllers/UserController.js";

const userRepository = new UserRepository(db);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

export { userRepository, userService, userController };
