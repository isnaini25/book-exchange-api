import { Notification } from '../database.js';

const getNotifications = async (userId, done) => {
  const notifications = await Notification.find({ receiver: userId })
    .sort({ created_at: 'desc' })
    .lean();

  return done(null, notifications);
};

const readNotifications = (userId, done) => {
  Notification.updateMany(
    { receiver: userId },
    { $set: { read: true } },
    { multi: true },
    (err, updated) => {
      if (err) return done(err, null);
      return done(null, updated);
    }
  );
};
export default {
  getNotifications,
  readNotifications,
};
