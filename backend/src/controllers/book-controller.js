import bookService from '../services/book-service.js';
import { success, error } from './response.js';

const getMyBooks = (req, res) => {
  bookService.getMyBooks(req.params.userId, (err, done) => {
    if (err) return error(res, err, err.status || 400);
    return success(res, done);
  });
};

const addMyBook = (req, res) => {
  bookService.addMyBook(req.params.userId, req.body, (err, done) => {
    if (err) return error(res, err, err.status || 400);
    return success(res, done);
  });
};

const deleteMyBook = (req, res) => {
  bookService.deleteMyBook(
    req.params.userId,
    req.params.bookId,
    (err, done) => {
      if (err) return error(res, err, err.status || 400);
      return success(res, done);
    }
  );
};

const updateMyBook = (req, res) => {
  bookService.updateMyBook(
    req.params.userId,
    req.params.bookId,
    req.body,
    (err, done) => {
      if (err) return error(res, err, err.status || 400);
      return success(res, done);
    }
  );
};

const getBook = (req, res) => {
  bookService.getBook(req.params.bookId, (err, done) => {
    if (err) return error(res, err, err.status || 400);
    return success(res, done);
  });
};
const getAllBooks = (req, res) => {
  bookService.getAllBooks((err, done) => {
    if (err) return error(res, err, err.status || 400);
    return success(res, done);
  });
};

export default {
  getMyBooks,
  getAllBooks,
  getBook,
  deleteMyBook,
  addMyBook,
  updateMyBook,
};
