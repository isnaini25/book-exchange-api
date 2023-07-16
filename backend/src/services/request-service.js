import { Book, Exchange, Notification, User } from '../database.js';
import { Types } from 'mongoose';
import pusher from '../pusher.js';

const createRequest = async (payload, done) => {
  const tradeFound = await Exchange.find({
    requester_id: payload.requester_id,
    book_taken: payload.book_taken,
    status: { $ne: 'Canceled' },
  }).lean();

  if (tradeFound.length < 1) {
    const newExchange = new Exchange({
      _id: new Types.ObjectId(),
      requester_id: payload.requester_id,
      owner_id: payload.owner_id,
      book_given: payload.book_given,
      book_taken: payload.book_taken,
      status: 'Waiting for approval',
      created_at: payload.created_at,
      updated_at: payload.created_at,
    });

    newExchange.save(async (err, data) => {
      if (err) return done(err, null);

      const bookFound = await Book.findById(payload.book_taken);
      const requester = await User.findById(payload.requester_id).lean();
      bookFound.requests.push(newExchange._id);
      bookFound.save();

      const notifications = {
        sender: payload.requester_id,
        receiver: payload.owner_id,
        title: 'New Exchange Request',
        text: requester.username + ' want to exchange ' + bookFound.title,
        data: { exchange_id: newExchange._id },
        created_at: payload.created_at,
      };
      new Notification(notifications).save();

      pusher.trigger(
        'user-' + payload.owner_id,
        'notifications',
        notifications
      );
      done(null, data);
    });
  } else {
    return done({ message: 'You take the same book' }, null);
  }
};

const getAllRequests = (type, done) => {
  let query = { status: 'Waiting for approval' };
  if (type === 'exchange') {
    query = { status: { $in: ['Exchanging', 'Completed'] } };
  }
  Exchange.find(query)
    .lean()
    .populate('requester_id', 'username  -_id')
    .populate({
      path: 'book_given',
      populate: { path: 'owner', select: 'username -_id' },
    })
    .populate({
      path: 'book_taken',
      populate: { path: 'owner', select: 'username -_id' },
    })
    .sort({ created_at: 'desc' })
    .exec((err, requests) => {
      if (err) return done(err, null);
      done(null, requests);
    });
};

const getMyRequests = (userId, done) => {
  Exchange.find({ requester_id: userId })
    .lean()
    .populate({
      path: 'book_given',
      populate: { path: 'owner', select: 'username -_id' },
    })
    .populate({
      path: 'book_taken',
      populate: { path: 'owner', select: 'username -_id' },
    })
    .sort({ updated_at: 'desc' })
    .exec((err, requests) => {
      if (err) return done(err, null);
      done(null, requests);
    });
};

const getMyExchanges = (userId, done) => {
  Exchange.find({
    status: 'Exchanging',
    $or: [{ owner_id: userId }, { requester_id: userId }],
  })
    .lean()
    .populate({
      path: 'book_given',
      populate: { path: 'owner', select: 'username -_id' },
    })
    .populate({
      path: 'book_taken',
      populate: { path: 'owner', select: 'username -_id' },
    })
    .sort({ updated_at: 'desc' })
    .exec((err, requests) => {
      if (err) return done(err, null);
      done(null, requests);
    });
};

const getIncomingRequests = (userId, done) => {
  Exchange.find({ owner_id: userId })
    .lean()
    .populate({
      path: 'book_given',
      populate: { path: 'owner', select: 'username -_id' },
    })
    .populate({
      path: 'book_taken',
      populate: { path: 'owner', select: 'username ' },
    })
    .sort({ updated_at: 'desc' })
    .exec((err, requests) => {
      if (err) return done(err, null);

      done(null, requests);
    });
};
const getRequest = (exchangeId, done) => {
  Exchange.findById(exchangeId)
    .lean()
    .populate({
      path: 'book_given',
      populate: { path: 'owner', select: 'username -_id' },
    })
    .populate({
      path: 'book_taken',
      populate: { path: 'owner', select: 'username ' },
    })
    .exec((err, requests) => {
      if (err) return done(err, null);

      done(null, requests);
    });
};

const updateRequest = async (exchangeId, payload, done) => {
  const { status, setter, updated_at } = payload;

  let updateData = {};

  updateData.updated_at = updated_at;
  if (status === 'accept') {
    updateData.status = 'Accepted';
  } else if (status === 'reject') {
    updateData.status = 'Rejected';
  } else if (status === 'cancel') {
    updateData.status = 'Canceled';
  }

  if (setter === 'requester' && status === 'exchanging') {
    updateData.requester_status = 'Exchanging';
  }
  if (setter === 'requester' && status === 'complete') {
    updateData.requester_status = 'Completed';
  }

  if (setter === 'owner' && status === 'exchanging') {
    updateData.owner_status = 'Exchanging';
  }
  if (setter === 'owner' && status === 'complete') {
    updateData.owner_status = 'Completed';
  }

  const trade = await Exchange.findById(exchangeId)
    .populate('owner_id')
    .populate('requester_id')
    .lean();

  const ownerStatusStored = trade.owner_status;
  const requesterStatusStored = trade.requester_status;

  if (ownerStatusStored || requesterStatusStored) {
    let exchangingCondition = ownerStatusStored
      ? ownerStatusStored === 'Exchanging' &&
        updateData.requester_status === 'Exchanging'
      : requesterStatusStored
      ? requesterStatusStored === 'Exchanging' &&
        updateData.owner_status === 'Exchanging'
      : null;

    let completedCondition = ownerStatusStored
      ? ownerStatusStored === 'Completed' &&
        updateData.requester_status === 'Completed'
      : requesterStatusStored
      ? requesterStatusStored === 'Completed' &&
        updateData.owner_status === 'Completed'
      : null;

    if (exchangingCondition) {
      updateData.status = 'Exchanging';
    }
    if (completedCondition) {
      updateData.status = 'Completed';
    }
  }

  Exchange.findByIdAndUpdate(exchangeId, updateData, { new: true }).exec(
    (err, tradeUpdated) => {
      if (err) return done(err, null);
      let notifications = {
        data: { exchange_id: trade._id },
        created_at: updated_at,
      };
      let text = 'exchange';
      if (tradeUpdated.status === 'Waiting for approval') {
        text = 'request';
      }
      if (setter === 'owner') {
        notifications = {
          ...notifications,
          title: 'My Exchange Request Updated',
          sender: trade.owner_id._id,
          receiver: trade.requester_id._id,
          text:
            status !== 'exchanging'
              ? trade.owner_id.username + ' ' + status + ' ' + text
              : trade.owner_id.username + ' start exchanging',
        };
        pusher.trigger(
          'user-' + trade.requester_id._id,
          'notifications',
          notifications
        );
      }
      if (setter === 'requester') {
        notifications = {
          ...notifications,
          title: 'Incoming Exchange Request Updated',
          sender: trade.requester_id._id,
          receiver: trade.owner_id._id,
          text:
            status !== 'exchanging'
              ? trade.requester_id.username + ' ' + status + ' ' + text
              : trade.requester_id.username + ' start exchanging',
        };
        pusher.trigger(
          'user-' + trade.owner_id._id,
          'notifications',
          notifications
        );
      }
      new Notification(notifications).save();

      done(null, tradeUpdated);
    }
  );
};

const deleteRequest = (exchangeId, done) => {
  Exchange.findByIdAndDelete(exchangeId, async (err, deleted) => {
    if (err) return done(err, null);

    Book.updateOne(
      { _id: deleted.book_taken._id },
      { $pull: { requests: exchangeId } },
      (err, updated) => {
        if (err) return done(err, null);

        done(null, deleted);
      }
    );
  });
};

export default {
  createRequest,
  getAllRequests,
  getMyRequests,
  updateRequest,
  deleteRequest,
  getIncomingRequests,
  getRequest,
  getMyExchanges,
};
