import Router from 'express';
import controller from '../controllers/book-controller.js';
import verifyToken from '../middleware/verify-token.js';
const bookRouter = new Router();

bookRouter
  .route('/books/my/:userId')
  .get(controller.getMyBooks)
  .post(verifyToken, controller.addMyBook);

bookRouter
  .route('/books/my/:userId/:bookId')
  .delete(verifyToken, controller.deleteMyBook)
  .patch(verifyToken, controller.updateMyBook);

bookRouter.get('/books', controller.getAllBooks);
bookRouter.get('/books/:bookId', controller.getBook);

export default bookRouter;
