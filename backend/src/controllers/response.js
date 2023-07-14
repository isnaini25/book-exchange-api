export const error = (res, err, code) => {
  res.status(code).json({ error: err }).end();
};

export const success = (res, data) => {
  res.status(200).json(data);
};
