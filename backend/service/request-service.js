const { Book, Trade } = require('../src/database');
const mongoose = require('mongoose');

const createRequest = (payload, done) => {
  Trade.find(
    { requester_id: payload.requester_id, book_taken: payload.book_taken },
    (err, found) => {
      if (err) return done(err, null);

      if (found.length < 1) {
        const newTrade = new Trade({
          _id: new mongoose.Types.ObjectId(),
          requester_id: payload.requester_id,
          owner_id: payload.owner_id,
          book_given: payload.book_given,
          book_taken: payload.book_taken,
          status: 'Waiting for approval',
          created_at: payload.created_at,
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

const getMyRequest = (userId, done) => {
  Trade.find({ requester_id: userId })
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

const getIncomingRequest = (userId, done) => {
  Trade.find({ owner_id: userId })
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
  let requesterStatus = '';
  let ownerStatus = '';
  let updateData = {};

  if (status === 'accept') {
    updateData = { status: 'Accepted' };
  } else if (status === 'reject') {
    updateData = { status: 'Rejected' };
  } else if (status === 'cancel') {
    updateData = { status: 'Canceled' };
  }

  if (setter === 'requester' && status === 'exchanging') {
    requesterStatus = 'Exchanging';
  }
  if (setter === 'requester' && status === 'complete') {
    requesterStatus = 'Completed';
  }

  if (setter === 'owner' && status === 'exchanging') {
    ownerStatus = 'Exchanging';
  }
  if (setter === 'owner' && status === 'complete') {
    ownerStatus = 'Completed';
  }

  const trade = await Trade.findById(exchangeId);
  const ownerStatusStored = trade.owner_status;
  const requesterStatusStored = trade.requester_status;

  if (ownerStatusStored || requesterStatusStored) {
    let exchangingCondition = ownerStatusStored
      ? ownerStatusStored === 'Exchanging' && requesterStatus === 'Exchanging'
      : requesterStatusStored
      ? requesterStatusStored === 'Exchanging' && ownerStatus === 'Exchanging'
      : null;

    let completedCondition = ownerStatusStored
      ? ownerStatusStored === 'Completed' && requesterStatus === 'Completed'
      : requesterStatusStored
      ? requesterStatusStored === 'Completed' && ownerStatus === 'Completed'
      : null;

    if (exchangingCondition) {
      updateData = { status: 'Exchanging' };
    }
    if (completedCondition) {
      updateData = { status: 'Completed' };
    }
  }

  if (ownerStatusStored && requesterStatus) {
    updateData = {
      ...updateData,
      updated_at,
      requester_status: requesterStatus,
    };
  }
  if (requesterStatusStored && ownerStatus) {
    updateData = {
      ...updateData,
      updated_at,
      owner_status: ownerStatus,
    };
  }

  Trade.findByIdAndUpdate(
    exchangeId,
    updateData,
    { new: true },
    (err, updated) => {
      if (err) return done(err, null);
      done(null, updated);
    }
  );
};

const deleteRequest = (exchangeId, done) => {
  Trade.findByIdAndDelete(exchangeId, async (err, deleted) => {
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

module.exports = {
  createRequest,
  getAllRequests,
  getMyRequest,
  updateRequest,
  deleteRequest,
  getIncomingRequest,
};
