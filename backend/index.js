import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import swaggerDocs from './swagger.js';
import cors from 'cors';
import env from 'dotenv';
import requestRouter from './src/routes/request-routes.js';
import bookRouter from './src/routes/book-routes.js';
import authRouter from './src/routes/auth-routes.js';
import router from './src/routes/index.js';
const app = express();
env.config();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

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
  return res.send(
    'Docs are available on <a href="' + process.env.HOST + '/api/docs">here</a>'
  );
});

app.use(router);
app.use(authRouter);
app.use(bookRouter);
app.use(requestRouter);

app.listen(process.env.PORT || 3000, () => {
  // console.log('Server running on port : ' + process.env.PORT);
  console.log(swaggerDocs(app, process.env.HOST));
});
