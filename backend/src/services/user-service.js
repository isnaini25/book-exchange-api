import { User, Book } from '../database.js';
import { emailValidation, isEmpty } from './auth-service.js';
import bcrypt from 'bcrypt';

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

const getMyProfile = (userId, done) => {
  User.findById(userId)
    .lean()
    .exec((err, user) => {
      if (err) return done(err, null);
      done(null, user);
    });
};

const updateMyProfile = async (userId, payload, done) => {
  const {
    fullname,
    username,
    city,
    email,
    avatar,
    changePassword,
    currentPassword,
    newPassword,
    newPasswordConfirmation,
  } = payload;

  const user = await User.findById(userId).exec();

  if (changePassword) {
    const currentPasswordIsInvalid = isEmpty(
      currentPassword,
      'current password'
    );
    const newPasswordIsInvalid = isEmpty(newPassword, 'new password');
    const newPasswordConfirmationIsInvalid = isEmpty(
      newPasswordConfirmation,
      'new password confirmation'
    );

    const error =
      currentPasswordIsInvalid ||
      newPasswordIsInvalid ||
      newPasswordConfirmationIsInvalid;

    const errorMessage = {
      newPassword: newPasswordIsInvalid ? newPasswordIsInvalid : null,
      currentPassword: currentPasswordIsInvalid
        ? currentPasswordIsInvalid
        : null,
      newPasswordConfirmationIsInvalid: newPasswordConfirmationIsInvalid
        ? newPasswordConfirmationIsInvalid
        : null,
    };

    if (error) {
      return done({ status: 422, message: errorMessage }, null);
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match)
      return done(
        {
          status: 422,
          message: { currentPassword: 'Wrong current password!' },
        },
        null
      );
    if (newPassword !== newPasswordConfirmation) {
      return done(
        {
          status: 422,
          message: { newPassword: 'New password does not match!' },
        },
        null
      );
    }
    if (newPassword.length < 5) {
      return done(
        {
          status: 422,
          message: { newPassword: 'Password must be at least 5 character' },
        },
        null
      );
    }

    const hashPass = await bcrypt.hash(newPassword, 10);

    user.password = hashPass;
  } else {
    const fullnameIsInvalid = isEmpty(fullname, 'fullname');
    const usernameIsInvalid = isEmpty(username, 'username');
    const cityIsInvalid = isEmpty(city, 'city');
    const emailIsInvalid = isEmpty(email, 'email') || emailValidation(email);

    const error =
      fullnameIsInvalid || usernameIsInvalid || cityIsInvalid || emailIsInvalid;

    const errorMessage = {
      fullname: fullnameIsInvalid ? fullnameIsInvalid : null,
      username: usernameIsInvalid ? usernameIsInvalid : null,
      city: cityIsInvalid ? cityIsInvalid : null,
      email: emailIsInvalid ? emailIsInvalid : null,
    };

    if (error) {
      return done({ status: 422, message: errorMessage }, null);
    }

    if (user.username !== username) {
      const userFound = await User.findOne({
        username,
        _id: { $ne: userId },
      }).lean();

      if (userFound) {
        return done(
          { status: 400, message: { username: 'Username already exist' } },
          null
        );
      }
    }
    user.fullname = fullname;
    user.username = username;
    user.email = email;
    user.avatar = avatar;
    user.city = city;
  }

  const newUser = await user.save();

  done(null, newUser);
};
export default {
  getAllUsers,
  getMyProfile,
  updateMyProfile,
};
