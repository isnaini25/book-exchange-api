import userService from '../services/user-service.js';
import { success, error } from './response.js';

const getAllUsers = (req, res) => {
  userService.getAllUsers((err, done) => {
    if (err) return error(res, err, err.status || 400);
    return success(res, done);
  });
};

export default { getAllUsers };
