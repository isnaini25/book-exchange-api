const { User, Book, Trade } = require('./database');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const userSignUp = (payload, done) => {
  const { fullname, username, city, email, password, confirmPassword } =
    payload;

  const isEmpty = (string, field) => {
    if (string.trim() === '') {
      return field + ' should not be empty!';
    }
    return false;
  };

  const passwordValidation = () => {
    if (password.length < 5) {
      return 'Password must be at least 5 character';
    }
    if (password !== confirmPassword) {
      return `Confirmation password doesn't match`;
    }
    return false;
  };

  const emailValidation = () => {
    const regExp = new RegExp('[a-z0-9]+@[a-z]+.[a-z]{2,3}');
    if (!email.match(regExp)) {
      console.log('email invalid');
      return 'You have entered an invalid email address!';
    }
    return false;
  };

  const fullnameIsInvalid = isEmpty(fullname, 'fullname');
  const usernameIsInvalid = isEmpty(username, 'username');
  const cityIsInvalid = isEmpty(city, 'city');
  const emailIsInvalid = isEmpty(email, 'email') || emailValidation();
  const passwordIsInvalid =
    isEmpty(password, 'password') || passwordValidation();

  const error =
    fullnameIsInvalid ||
    usernameIsInvalid ||
    cityIsInvalid ||
    emailIsInvalid ||
    passwordIsInvalid;

  const errorMessage = {
    fullname: fullnameIsInvalid ? fullnameIsInvalid : null,
    username: usernameIsInvalid ? usernameIsInvalid : null,
    city: cityIsInvalid ? cityIsInvalid : null,
    email: emailIsInvalid ? emailIsInvalid : null,
    password: passwordIsInvalid ? passwordIsInvalid : null,
  };

  if (error) {
    return done({ status: 422, message: errorMessage }, null);
  }

  bcrypt.hash(password, 10, async (err, hash) => {
    if (err) return done(err, null);

    const newUser = new User({
      fullname,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      city,
      password: hash,
    });

    newUser.save(async (err, data) => {
      if (err) return done(err, null);
      const { _id, username, email } = data;
      const accessToken = jwt.sign(
        { _id, username, email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15s' }
      );
      const refreshToken = jwt.sign(
        { _id, username, email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
      );

      await User.findByIdAndUpdate(_id, { refresh_token: refreshToken });

      done(null, { id: _id, username, accessToken, refreshToken });
    });
  });
};

// user login : username & password
const userLogIn = (payload, done) => {
  const { password, username } = payload;
  const isEmpty = (string, field) => {
    if (string.trim() === '') {
      return field + ' should not be empty!';
    }
    return false;
  };
  const passwordIsEmpty = isEmpty(password, 'password');
  const usernameIsEmpty = isEmpty(username, 'username');

  if (passwordIsEmpty || usernameIsEmpty) {
    return done({
      status: 422,
      message: {
        username: usernameIsEmpty ? usernameIsEmpty : null,
        password: passwordIsEmpty ? passwordIsEmpty : null,
      },
    });
  }

  User.find({ username: username.toLowerCase() }).exec(
    async (err, userFound) => {
      if (err) return done(err, null);

      if (userFound.length > 0) {
        const match = await bcrypt.compare(password, userFound[0].password);
        if (!match)
          return done(
            { status: 400, message: { password: 'Wrong password!' } },
            null
          );

        const { _id, username, email } = userFound[0];

        const accessToken = jwt.sign(
          { _id, username, email },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '15s' }
        );
        const refreshToken = jwt.sign(
          { _id, username, email },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: '1d' }
        );

        await User.findByIdAndUpdate(_id, { refresh_token: refreshToken });

        done(null, { id: _id, username, accessToken, refreshToken });
      } else {
        return done(
          { status: 401, message: { username: 'Username not found' } },
          null
        );
      }
    }
  );
};

const userLogOut = async (refreshToken, done) => {
  if (!refreshToken)
    return done({ status: 204, message: 'Token not found' }, null);
  const user = await User.find({ refresh_token: refreshToken });

  if (!user[0]) return done({ status: 204, message: 'No content' }, null);

  await User.findByIdAndUpdate(user[0]._id, { refresh_token: null });
  return done(null, { message: 'Logout Success!' });
};

// get all users : username
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

const createRequest = (payload, done) => {
  Trade.find(
    { requester_id: payload.requester_id, book_taken: payload.book_taken },
    (err, found) => {
      if (err) return done(err, null);

      if (found.length < 1) {
        const newTrade = new Trade({
          _id: new mongoose.Types.ObjectId(),
          requester_id: payload.requester_id,
          book_given: payload.book_given,
          book_taken: payload.book_taken,
          status: 'Waiting for approval',
        });

        newTrade.save((err, data) => {
          if (err) return done(err, null);

          Book.findById(payload.book_taken).exec((err, book) => {
            if (err) return done(err, null);
            book.requests.push(newTrade._id);
            book.save();
            done(null, data);
          });
        });
      } else {
        return done({ message: 'You take the same book' }, null);
      }
    }
  );
};

const getAllRequests = (done) => {
  Trade.find({ status: 'Waiting for approval' })
    .populate('requester_id', 'username  -_id')
    .populate({
      path: 'book_given',
      populate: { path: 'owner', select: 'username -_id' },
    })
    .populate({
      path: 'book_taken',
      populate: { path: 'owner', select: 'username -_id' },
    })
    .exec((err, requests) => {
      if (err) return done(err, null);
      done(null, requests);
    });
};

const acceptRequest = (tradeId, status, done) => {
  const statusToSet = 'Accepted';
  if (status === 'reject') {
    statusToSet = 'Rejected';
  }
  Trade.findByIdAndUpdate(tradeId, { status: statusToSet }, (err, updated) => {
    if (err) return done(err, null);
    done(null, updated);
  });
};

const cancelRequest = (tradeId, done) => {
  Trade.findByIdAndDelete(tradeId, (err, deleted) => {
    if (err) return done(err, null);
    done(null, deleted);
  });
};

const refreshToken = async (refreshToken, done) => {
  try {
    if (!refreshToken)
      return done({ status: 401, message: 'Token missing' }, null);
    const user = await User.findOne({ refresh_token: refreshToken });

    if (!user) return done({ status: 403, message: 'Auth is invalid' }, null);

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) return done({ status: 403, message: 'expired' }, null);
        const { _id, username, email } = user;

        const accessToken = jwt.sign(
          { _id, username, email },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: '15s',
          }
        );

        return done(null, { accessToken });
      }
    );
  } catch (error) {
    return done(error, null);
  }
};
module.exports = {
  userSignUp,
  userLogIn,
  userLogOut,
  getAllUsers,
  getMyBooks,
  addMyBook,
  deleteMyBook,
  updateMyBook,
  getBook,
  getAllBooks,
  createRequest,
  getAllRequests,
  acceptRequest,
  cancelRequest,
  refreshToken,
};
