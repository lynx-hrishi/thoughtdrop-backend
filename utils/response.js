export const successResponse = (res, message, data = null, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    timestamp: new Date().toISOString(),
    data,
  });
};

export const errorResponse = (
  res,
  status,
  title,
  message,
  error,
  stackTrace,
  ...extras
) => {
  const response = {
    success: false,
    status,
    title,
    message,
    timestamp: new Date().toISOString(),
  };

  if (Array.isArray(error)) {
    response.errors = error;
  } else if (error) {
    response.error = error;
  }

  for (const extra of extras) {
    if (extra && typeof extra === "object") {
      Object.assign(response, extra);
    }
  }

  if (process.env.NODE_ENV !== "production" && stackTrace) {
    response.stackTrace = stackTrace;
  }

  return res.status(status).json(response);
};
