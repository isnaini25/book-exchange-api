import { Book } from '../database.js';

const addMyBook = (userId, payload, done) => {
  const newBook = new Book({
    title: payload.title,
    author: payload.author,
    description: payload.description,
    owner: userId,
    status: 'Available',
  });

  newBook.save((err, data) => {
    if (err) return done(err, null);
    done(null, data);
  });
};
const getMyBooks = (userId, done) => {
  Book.find({ owner: userId })
    .populate({
      path: 'requests',
      populate: { path: 'requester_id', select: 'username -_id' },
      select: 'requester_id status',
    })
    .exec((err, books) => {
      if (err) return done(err, null);
      done(null, books);
    });
};

const deleteMyBook = (userId, bookId, done) => {
  Book.findOneAndDelete({ owner: userId, _id: bookId }, (err, deleted) => {
    if (err) return done(err, null);
    done(null, deleted);
  });
};

const updateMyBook = (userId, bookId, payload, done) => {
  const bookToSet = {
    title: payload.title,
    author: payload.author,
    description: payload.description,
    status: payload.status,
    request: payload.request,
  };
  Book.findOneAndUpdate(
    { owner: userId, _id: bookId },
    bookToSet,
    { new: true },
    (err, updated) => {
      if (err) return done(err, null);
      done(null, updated);
    }
  );
};

const getBook = (bookId, done) => {
  Book.findOne({ _id: bookId })
    .populate({ path: 'owner', select: 'username city' })
    .populate('requests', 'status')
    .exec((err, bookFound) => {
      if (err) return done(err, null);
      done(null, bookFound);
    });
};

const getAllBooks = (done) => {
  Book.find()
    .populate({ path: 'owner', select: 'username city' })
    .populate('requests', 'status')
    .exec((err, books) => {
      if (err) return done(err, null);
      done(null, books);
    });
};

export default {
  addMyBook,
  deleteMyBook,
  updateMyBook,
  getBook,
  getMyBooks,
  getAllBooks,
};
