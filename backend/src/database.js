const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//User
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      minlength: [5, 'Username must be at least 5 character'],
    },
    password: {
      type: String,
      required: true,
      minlength: [5, 'Must be at least 5 character'],
    },
    city: String,
    fullname: String,
    email: {
      type: String,
      unique: true,
    },
    refresh_token: String,
  },
  { versionKey: false }
);

const User = new mongoose.model('User', userSchema);

//Book
const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: String,
    description: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trade',
      },
    ],
    status: String,
  },
  { versionKey: false }
);

const Book = mongoose.model('Book', bookSchema);

//Trade
const tradeSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    requester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    book_given: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    book_taken: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    status: String,
    requester_status: String,
    owner_status: String,
    created_at: Date,
    updated_at: Date,
  },
  { versionKey: false }
);

const Trade = mongoose.model('Trade', tradeSchema);

const notificationSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: String,
    text: String,
    created_at: Date,
    data: Object,
    read: { type: Boolean, default: false },
  },
  { versionKey: false }
);

const Notification = mongoose.model('Notification', notificationSchema);

const chatSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    members: Array,
    last_message: String,
    sender: String,
    read: { type: Boolean, default: false },
    timestamp: Date,
    unread_message: Object,
  },
  { versionKey: false }
);

const Chat = mongoose.model('Chat', chatSchema);

const messageSchema = new mongoose.Schema(
  {
    chat_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    messages: [
      {
        sender: String,
        message: String,
        timestamp: Date,
        attachment: Object,
        read: { type: Boolean, default: false },
      },
    ],
  },
  { versionKey: false }
);

const Message = mongoose.model('Message', messageSchema);

module.exports = {
  User,
  Book,
  Trade,
  Notification,
  Chat,
  Message,
};
