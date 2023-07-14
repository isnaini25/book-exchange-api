import jwt from 'jsonwebtoken';

export default function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null)
    return res
      .status(401)
      .json({ error: { message: 'Missing authorization headers ' } })
      .end();

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: err }).end();
    req.username = decoded.username;
    next();
  });
}
