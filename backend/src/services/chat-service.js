import { default as mongoose } from 'mongoose';
import { Chat, Message } from '../database.js';
import pusher from '../pusher.js';

const sendMessage = async (payload, done) => {
  const chatId = new mongoose.Types.ObjectId();
  const { message, sender, receiver, timestamp, attachment } = payload;
  const chatRoom = 'chat-' + receiver + '-' + sender;
  const chatFound = await Chat.findOne({
    members: { $all: [sender, receiver] },
  });

  let newChat = {
    last_message: message.trim(),
    timestamp: timestamp,
    sender,
    read: false,
  };

  let newMessage = {
    sender,
    message: message.trim(),
    timestamp,
    attachment,
  };
  let isOnline = false;
  const res = await pusher.get({ path: '/channels' });
  if (res.status === 200) {
    const body = await res.json();
    const channelsInfo = Object.keys(body.channels);
    isOnline = channelsInfo.includes(chatRoom);
  }
  if (isOnline) {
    newChat.read = true;
    newMessage.read = true;
  }

  if (chatFound) {
    const path = 'unread_message.' + receiver;
    Chat.updateOne(
      { chat_id: chatFound._id },
      { ...newChat, $inc: { [path]: isOnline ? 0 : 1 } }
    ).exec();

    Message.updateOne(
      { chat_id: chatFound._id },

      {
        $push: {
          messages: newMessage,
        },
      }
    ).exec();

    newMessage.chat_id = chatFound._id;
  } else {
    new Chat({
      ...newChat,
      _id: chatId,
      members: [sender, receiver],
      unread_message: {
        [receiver]: isOnline ? 0 : 1,
      },
    }).save();
    new Message({
      chat_id: chatId,
      messages: newMessage,
    }).save();
    newMessage.chat_id = chatId;
  }

  if (!isOnline) {
    pusher.trigger('chat-' + receiver, 'chats', newMessage);
  }

  pusher.trigger(chatRoom, 'new_chats', newMessage);

  done(null, newMessage);
};

const getChats = async (username, done) => {
  const chats = await Chat.find({ members: username }).lean();

  const unreadMessage = chats.map((chat) => chat.unread_message[username]);

  done(null, { chats, unread_message: unreadMessage });
};

const readChats = async (reader, peer, done) => {
  const path = 'unread_message.' + reader;
  const chats = await Chat.findOne({ members: { $all: [reader, peer] } });

  const messages = await Message.findOne({
    chat_id: chats._id,
  });

  if (chats[path] !== 0) {
    chats.updateOne({ read: true, [path]: 0 }).exec();
    messages.messages = messages.messages.map((msg) =>
      msg.sender === peer ? { ...msg, read: true } : msg
    );
    messages.save();
  }
  done(null, messages);
};

export default {
  sendMessage,
  getChats,
  readChats,
};
