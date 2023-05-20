const jwt = require("jsonwebtoken");

const createToken = (data) => {
  const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "1h" });
  return token;
};

const decodeToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
};

module.exports = { createToken, decodeToken };
