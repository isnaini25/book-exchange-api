import { User, Book } from '../database.js';

const getAllUsers = (done) => {
  User.find({}).exec((err, users) => {
    if (err) return done(err, null);

    const userData = [];

    Promise.all(
      users.map(async (user) => {
        await Book.find({ owner: user._id })
          .populate({
            path: 'requests',
          })
          .then((booksFound) => {
            let req = [];
            booksFound.forEach((book) => {
              req = book.requests.filter(
                (item) => item.status === 'Waiting for approval'
              );
            });

            userData.push({
              id: user._id,
              username: user.username,
              city: user.city,
              books: booksFound,
              incoming_requests: req.length,
            });
          });
      })
    ).then(() => {
      done(null, userData);
    });
  });
};

export default {
  getAllUsers,
};
