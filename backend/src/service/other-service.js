const { Book, Trade, User, Notification } = require('../database');

const getAmount = async (done) => {
  const books = await Book.countDocuments().lean();
  const users = await User.countDocuments().lean();
  const exchanges = await Trade.countDocuments({
    status: { $ne: 'Waiting for approval' },
  }).lean();
  const requests = await Trade.countDocuments({
    status: 'Waiting for approval',
  }).lean();

  return done(null, {
    books,
    users,
    exchanges,
    requests,
  });
};

const getNotifications = async (userId, done) => {
  const notifications = await Notification.find({ receiver: userId })
    .sort({ created_at: 'desc' })
    .lean();

  return done(null, notifications);
};

const readNotifications = (userId, done) => {
  Notification.updateMany(
    { receiver: userId },
    { $set: { read: true } },
    { multi: true },
    (err, updated) => {
      if (err) return done(err, null);
      return done(null, updated);
    }
  );
};
module.exports = {
  getAmount,
  getNotifications,
  readNotifications,
};
// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyBouKqP91jT_nzAdglr0HZ-cgql7gkgVKI",
//   authDomain: "book-exchange-b95af.firebaseapp.com",
//   projectId: "book-exchange-b95af",
//   storageBucket: "book-exchange-b95af.appspot.com",
//   messagingSenderId: "246994713126",
//   appId: "1:246994713126:web:9cd67db186dfc3be1844e7"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
