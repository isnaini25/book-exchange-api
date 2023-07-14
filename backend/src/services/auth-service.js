import { User } from '../database.js';
import { hash as _hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import env from 'dotenv';
env.config();

const userSignUp = (payload, done) => {
  const { fullname, username, city, email, password, confirmPassword } =
    payload;

  const isEmpty = (string, field) => {
    if (string === undefined) {
      return 'Missing ' + field;
    }
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

  _hash(password, 10, async (err, hash) => {
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
    if (string === undefined) {
      return 'Missing ' + field;
    }
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
        const match = await compare(password, userFound[0].password);
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

const refreshToken = async (refreshToken, done) => {
  try {
    if (!refreshToken)
      return done({ status: 401, message: 'Missing refresh token ' }, null);
    const user = await User.findOne({ refresh_token: refreshToken });

    if (!user) return done({ status: 401, message: 'Auth is invalid' }, null);

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) return done({ status: 401, message: 'Token expired' }, null);
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

export default {
  userSignUp,
  userLogIn,
  userLogOut,
  refreshToken,
};
