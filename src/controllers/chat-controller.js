import chatService from '../services/chat-service.js';
import { success, error } from './response.js';

const sendMessage = (req, res) => {
  chatService.sendMessage(req.body, (err, done) => {
    if (err) return error(res, err, 400);

    return success(res, done);
  });
};

const getChats = (req, res) => {
  if (req.query.username) {
    chatService.getChats(req.query.username, (err, done) => {
      if (err) return error(res, err, 400);

      return success(res, done);
    });
  } else {
    return error(res, { message: 'Query not found' }, 400);
  }
};

const readChats = (req, res) => {
  chatService.readChats(req.body.reader, req.body.peer, (err, done) => {
    if (err) return error(res, err, 400);

    return success(res, done);
  });
};

export default { sendMessage, readChats, getChats };
