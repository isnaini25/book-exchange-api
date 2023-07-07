const { Book, Trade, User } = require('../src/database');

const getAmount = async (done) => {
  const books = await Book.countDocuments();
  const users = await User.countDocuments();
  const exchanges = await Trade.countDocuments({
    status: { $ne: 'Waiting for approval' },
  });
  const requests = await Trade.countDocuments({
    status: 'Waiting for approval',
  });

  return done(null, {
    books,
    users,
    exchanges,
    requests,
  });
};

module.exports = {
  getAmount,
};
