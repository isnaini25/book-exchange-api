import { authorizeChannel } from '../pusher';
import { push } from '../online-users';
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
    const authResponse = authorizeChannel(socket_id, channel_name, user);
    push({ [channel_name]: 'online' });
    done(null, authResponse);
    console.log(authResponse);
  }
};

export default {
  authenticateUser,
};
