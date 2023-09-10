import userService from '../services/user-service.js';
import { success, error } from './response.js';

const getAllUsers = (req, res) => {
  userService.getAllUsers((err, done) => {
    if (err) return error(res, err, err.status || 400);
    return success(res, done);
  });
};

const getMyProfile = (req, res) => {
  userService.getMyProfile(req.params.userId, (err, done) => {
    if (err) return error(res, err, err.status || 400);
    return success(res, done);
  });
};

const updateMyProfile = (req, res) => {
  userService.updateMyProfile(req.params.userId, req.body, (err, done) => {
    if (err) return error(res, err, err.status || 400);
    return success(res, done);
  });
};
export default { getAllUsers, getMyProfile, updateMyProfile };
