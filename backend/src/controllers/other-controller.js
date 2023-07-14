import service from '../services/other-service.js';
import { success, error } from './response.js';

const getAmount = (req, res) => {
  service.getAmount((err, done) => {
    if (err) return error(res, err, err.status || 400);
    return success(res, done);
  });
};

export default { getAmount };
