export const errorHandler = (err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  const status = Number.isInteger(err?.status) ? err.status : 500;
  const isClientError = status >= 400 && status < 500;

  const message =
    isClientError && err?.message
      ? err.message
      : "Something went wrong. Please try again later.";

  res.status(status).json({ message });
};

