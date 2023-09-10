import Router from 'express';
import controller from '../controllers/request-controller.js';
import verifyToken from '../middleware/verify-token.js';
const requestRouter = new Router();

requestRouter.get('/requests?', controller.getAllRequests);
requestRouter
  .route('/requests/new')
  .post(verifyToken, controller.createRequest);

requestRouter
  .route('/requests/:exchangeId')
  .get(verifyToken, controller.getRequest)
  .post(verifyToken, controller.updateRequest)
  .delete(verifyToken, controller.deleteRequest);

requestRouter
  .route('/requests/my/:userId')
  .get(verifyToken, controller.getMyRequests);
//   .post(controller.updateMyRequest);

requestRouter
  .route('/requests/incoming/:userId')
  .get(verifyToken, controller.getIncomingRequests);

requestRouter.get('/exchanges/:userId', controller.getMyExchanges);
export default requestRouter;
