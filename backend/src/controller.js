const userService = require('./service/user-service');
const authService = require('./service/auth-service');
const bookService = require('./service/book-service');
const requestsService = require('./service/request-service');
const pusherService = require('./service/pusher-service');
const service = require('./service/other-service');
const chatService = require('./service/chat-service');
const error = (res, err, code) => {
  res.status(code).json({ error: err }).end();
};

const success = (res, data) => {
  res.status(200).json(data);
};

const userSignUp = (req, res) => {
  authService.userSignUp(req.body, (err, done) => {
    if (err) {
      if (err.code == 11000) {
        let message = {};

        if (err.keyPattern.username) {
          message = { username: 'Username already exist' };
        }

        if (err.keyPattern.email) {
          message = { email: 'Email already used' };
        }

        return error(res, { message }, 400);
      } else {
        return error(res, err, err.status || 400);
      }
    }
    // res.cookie('logged_in', 1, {
    //   maxAge: 24 * 60 * 60 * 1000,
    //   secure: true,
    // });
    res.cookie('refresh_token', done.refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    // onlineUsers.push({ ...done });
    return success(res, done);
  });
};

const userLogIn = (req, res) => {
  authService.userLogIn(req.body, (err, done) => {
    if (err) {
      return error(res, err, err.status || 400);
    }

    res.cookie('refresh_token', done.refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return success(res, {
      message: 'Login success!',
      accessToken: done.accessToken,
    });
  });
};

const userLogOut = (req, res) => {
  authService.userLogOut(req.cookies.refresh_token, (err, done) => {
    res.clearCookie('refresh_token');
    if (err) return error(res, err, err.status || 400);

    return success(res, done);
  });
};

const getAllUsers = (req, res) => {
  userService.getAllUsers((err, done) => {
    if (err) return error(res, err, err.status || 400);
    return success(res, done);
  });
};

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

const createRequest = (req, res) => {
  requestsService.createRequest(req.body, (err, done) => {
    if (err) return error(res, err, err.status || 400);

    return success(res, done);
  });
};

const getAllRequests = (req, res) => {
  requestsService.getAllRequests((err, done) => {
    if (err) return error(res, err, err.status || 400);
    return success(res, done);
  });
};

const getMyRequests = (req, res) => {
  requestsService.getMyRequests(req.params.userId, (err, done) => {
    if (err) return error(res, err, err.status || 400);
    return success(res, done);
  });
};

const getIncomingRequests = (req, res) => {
  requestsService.getIncomingRequests(req.params.userId, (err, done) => {
    if (err) return error(res, err, err.status || 400);
    return success(res, done);
  });
};
const getRequest = (req, res) => {
  requestsService.getRequest(req.params.exchangeId, (err, done) => {
    if (err) return error(res, err, err.status || 400);
    return success(res, done);
  });
};

const updateRequest = (req, res) => {
  const status = req.body.status;

  if (
    status.toLowerCase() === 'accept' ||
    status.toLowerCase() === 'reject' ||
    status.toLowerCase() === 'cancel' ||
    status.toLowerCase() === 'exchanging' ||
    status.toLowerCase() === 'complete'
  ) {
    requestsService.updateRequest(
      req.params.exchangeId,
      req.body,
      (err, done) => {
        if (err) return error(res, err, err.status || 400);

        return success(res, done);
      }
    );
  } else {
    return error(res, { message: 'Query not found' }, 400);
  }
};

const refreshToken = (req, res) => {
  authService.refreshToken(req.cookies.refresh_token, (err, done) => {
    if (err) return error(res, err, err.status || 400);
    return success(res, done);
  });
};

const getAmount = (req, res) => {
  service.getAmount((err, done) => {
    if (err) return error(res, err, err.status || 400);
    return success(res, done);
  });
};

const deleteRequest = (req, res) => {
  requestsService.deleteRequest(req.params.exchangeId, (err, done) => {
    if (err) return error(res, err, err.status || 400);
    // res.io.sockets.emit('set_delete_requests', done);
    return success(res, done);
  });
};

const pusherAuthenticateUser = (req, res) => {
  pusherService.authenticateUser(req.body, (err, done) => {
    if (err) return error(res, err, err.status || 400);

    return success(res, done);
  });
};

const getNotifications = (req, res) => {
  service.getNotifications(req.params.userId, (err, done) => {
    if (err) return error(res, err, err.status || 400);

    return success(res, done);
  });
};

const readNotifications = (req, res) => {
  service.readNotifications(req.params.userId, (err, done) => {
    if (err) return error(res, err, err.status || 400);

    return success(res, done);
  });
};

const sendMessage = (req, res) => {
  chatService.sendMessage(req.body, (err, done) => {
    if (err) return error(res, err, 400);

    return success(res, done);
  });
};

const getChats = (req, res) => {
  if (req.query.username) {
    chatService.getChats(req.query.username, (err, done) => {
      if (err) return error(res, err, 400);

      return success(res, done);
    });
  } else {
    return error(res, { message: 'Query not found' }, 400);
  }
};

const readChats = (req, res) => {
  chatService.readChats(req.body.reader, req.body.peer, (err, done) => {
    if (err) return error(res, err, 400);

    return success(res, done);
  });
};
module.exports = {
  userSignUp,
  userLogIn,
  getAllUsers,
  getMyBooks,
  addMyBook,
  deleteMyBook,
  updateMyBook,
  getBook,
  getAllBooks,
  createRequest,
  getAllRequests,
  updateRequest,
  userLogOut,
  refreshToken,
  getMyRequests,
  getIncomingRequests,
  getRequest,
  getAmount,
  deleteRequest,
  pusherAuthenticateUser,
  getNotifications,
  readNotifications,
  sendMessage,
  getChats,
  readChats,
};
