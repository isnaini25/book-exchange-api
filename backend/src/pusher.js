const Pusher = require('pusher');

const pusher = new Pusher({
  appId: '1631637',
  key: 'ded064230ace4dfe4553',
  secret: 'e3ade97bdcbe52e167b9',
  cluster: 'ap1',
  useTLS: true,
});

module.exports = pusher;
