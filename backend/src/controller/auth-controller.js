const { success, error } = require('./response');
const authService = require('./service/auth-service');

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

    res.cookie('refresh_token', done.refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

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
