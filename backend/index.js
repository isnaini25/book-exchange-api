const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const controller = require('./src/controller');
const { swaggerDocs } = require('./swagger');
const { verifyToken } = require('./src/middleware/verifyToken');

app.use(cors({ origin: true, credentials: true }));

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
//   next();
// });

app.get('/', (req, res) => {
  return res.json({ message: 'home' });
});

// app.post('/pusher/user-auth', controller.pusherAuthenticateUser);
app.get('/token', controller.refreshToken);

app.post('/signup', controller.userSignUp);

app.post('/login', controller.userLogIn);
app.delete('/logout', controller.userLogOut);

app.get('/users', controller.getAllUsers);

app
  .route('/books/my/:userId')
  .get(controller.getMyBooks)
  .post(verifyToken, controller.addMyBook);

app
  .route('/books/my/:userId/:bookId')
  .delete(verifyToken, controller.deleteMyBook)
  .patch(verifyToken, controller.updateMyBook);

app.get('/books', controller.getAllBooks);
app.get('/books/:bookId', controller.getBook);

app.get('/requests', controller.getAllRequests);
app.route('/requests/new').post(verifyToken, controller.createRequest);
app
  .route('/requests/:exchangeId')
  .get(verifyToken, controller.getRequest)
  .post(verifyToken, controller.updateRequest)
  .delete(verifyToken, controller.deleteRequest);

app.route('/requests/my/:userId').get(verifyToken, controller.getMyRequests);
//   .post(controller.updateMyRequest);

app
  .route('/requests/incoming/:userId')
  .get(verifyToken, controller.getIncomingRequests);

app.get('/amount', controller.getAmount);

app
  .route('/notifications/:userId')
  .get(verifyToken, controller.getNotifications)
  .post(verifyToken, controller.readNotifications);

app.route('/chats').post(controller.sendMessage).patch(controller.readChats);
app.get('/chats?', controller.getChats);
app.listen(process.env.PORT || 3000, () => {
  console.log('Server running on port : ' + process.env.PORT);
  console.log(swaggerDocs(app, process.env.HOST));
});
