import Router from 'express';
import controller from '../controllers/auth-controller.js';

const authRouter = new Router();

authRouter.get('/token', controller.refreshToken);

authRouter.post('/signup', controller.userSignUp);

authRouter.post('/login', controller.userLogIn);
authRouter.delete('/logout', controller.userLogOut);

export default authRouter;
