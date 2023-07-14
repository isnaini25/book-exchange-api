const pusher = require('../pusher');
const onlineUsers = require('../online-users');
const authenticateUser = (payload, done) => {
  const { socket_id, user_id, username, channel_name } = payload;

  const user = {
    id: user_id,
    user_info: {
      username: username,
    },
  };
  // if (user_id) {
  //   const authResponse = pusher.authenticateUser(socket_id, user);

  //   done(null, authResponse);
  // }
  if (channel_name) {
    const authResponse = pusher.authorizeChannel(socket_id, channel_name, user);
    onlineUsers.push({ [channel_name]: 'online' });
    done(null, authResponse);
    console.log(authResponse);
  }
};

module.exports = {
  authenticateUser,
};
