import { success, error } from './response.js';
import authService from '../services/auth-service.js';

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
      sameSite: 'Lax',
      secure: true,
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
      secure: true,
      sameSite: 'Lax',
    });

    return success(res, {
      message: 'Login success!',
      ...done,
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

const refreshToken = (req, res) => {
  authService.refreshToken(req.cookies.refresh_token, (err, done) => {
    if (err) return error(res, err, err.status || 400);
    return success(res, done);
  });
};

export default { userLogIn, userSignUp, userLogOut, refreshToken };
