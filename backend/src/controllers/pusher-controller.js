import pusherService from '../services/pusher-service.js';
import { success, error } from './response.js';

const pusherAuthenticateUser = (req, res) => {
  pusherService.authenticateUser(req.body, (err, done) => {
    if (err) return error(res, err, err.status || 400);

    return success(res, done);
  });
};

export default { pusherAuthenticateUser };
