import Router from 'express';
const router = new Router();
import userController from '../controllers/user-controller.js';
import notificationController from '../controllers/notification-controller.js';
import otherController from '../controllers/other-controller.js';
import chatController from '../controllers/chat-controller.js';
import verifyToken from '../middleware/verify-token.js';

router.get('/users', userController.getAllUsers);
router.get('/amount', otherController.getAmount);

router
  .route('/notifications/:userId')
  .get(verifyToken, notificationController.getNotifications)
  .post(verifyToken, notificationController.readNotifications);

router
  .route('/chats')
  .post(chatController.sendMessage)
  .patch(chatController.readChats);
router.get('/chats?', chatController.getChats);

export default router;
