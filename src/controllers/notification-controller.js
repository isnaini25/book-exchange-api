import notificationService from '../services/notification-service.js';
import { success, error } from './response.js';

const getNotifications = (req, res) => {
  notificationService.getNotifications(req.params.userId, (err, done) => {
    if (err) return error(res, err, err.status || 400);

    return success(res, done);
  });
};
const readNotifications = (req, res) => {
  notificationService.readNotifications(req.params.userId, (err, done) => {
    if (err) return error(res, err, err.status || 400);

    return success(res, done);
  });
};

export default { getNotifications, readNotifications };
