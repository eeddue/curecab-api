const mongoose = require("mongoose");
const DbConnect = async (req, res) => {
  try {
    mongoose.connect(process.env.MONGO_URI);
    console.log("Db running");
  } catch (error) {
    console.log(error);
  }
};

module.exports = DbConnect;
