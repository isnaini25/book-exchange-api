import requestService from '../services/request-service.js';
import { success, error } from './response.js';

const createRequest = (req, res) => {
  requestService.createRequest(req.body, (err, done) => {
    if (err) return error(res, err, err.status || 400);

    return success(res, done);
  });
};

const getAllRequests = (req, res) => {
  requestService.getAllRequests(req.query.type, (err, done) => {
    if (err) return error(res, err, err.status || 400);
    return success(res, done);
  });
};

const getMyRequests = (req, res) => {
  requestService.getMyRequests(req.params.userId, (err, done) => {
    if (err) return error(res, err, err.status || 400);
    return success(res, done);
  });
};
const getMyExchanges = (req, res) => {
  requestService.getMyExchanges(req.params.userId, (err, done) => {
    if (err) return error(res, err, err.status || 400);

    return success(res, done);
  });
};

const getIncomingRequests = (req, res) => {
  requestService.getIncomingRequests(req.params.userId, (err, done) => {
    if (err) return error(res, err, err.status || 400);
    return success(res, done);
  });
};
const getRequest = (req, res) => {
  requestService.getRequest(req.params.exchangeId, (err, done) => {
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
    requestService.updateRequest(
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

const deleteRequest = (req, res) => {
  requestService.deleteRequest(req.params.exchangeId, (err, done) => {
    if (err) return error(res, err, err.status || 400);
    // res.io.sockets.emit('set_delete_requests', done);
    return success(res, done);
  });
};

export default {
  createRequest,
  getAllRequests,
  getIncomingRequests,
  getMyRequests,
  getMyExchanges,
  getRequest,
  deleteRequest,
  updateRequest,
};
