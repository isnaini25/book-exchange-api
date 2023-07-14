import { Book, Trade, User } from '../database.js';

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

export default {
  getAmount,
};
