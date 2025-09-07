exports.Exception = function (res, status, message, data = "") {
  return res.status(status).json({
    status,
    Message: message,
    errors: data,
  });
};

exports.loginFailed = function (res, status, message) {
  return res.status(status).json({
    Status: status,
    Message: message,
  });
};

exports.successDetails = function (res, status, message, access_token) {
  return res.status(status).json({
    Status: status,
    Message: message,
    access_token,
    token_type: "bearer",
  });
};

exports.loginSuccess = function (res, result, status, message, access_token) {
  const roleData = result.role;
  return res.status(status).json({
    Data: { roleData },
    Status: status,
    Message: message,
    access_token,
    token_type: "bearer",
  });
};

exports.items = function (res, result, status, message) {
  return res.status(status).json({
    Data: result,
    Status: status,
    Message: message,
  });
};

exports.ResetPasswordException = function (res, status, message, data) {
  return res.status(status).json({
    status,
    Message: message,
    errors: data,
  });
};

exports.storeSuccess = function (res, status, message, result) {
  return res.status(status).json({
    Status: status,
    Message: message,
    result,
  });
};
