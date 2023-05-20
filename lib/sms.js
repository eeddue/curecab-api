const client = require("twilio")(
  process.env.TWILIO_ACC_SID,
  process.env.TWILIO_AUHT_TOKEN
);

const sendMessage = (to, message) => {
  client.messages
    .create({
      body: message,
      from: "+12542562264",
      to: "+254114357926",
    })
    .then((message) => console.log("Message sent"))
    .catch((error) => {
      console.log(error);
    });
};

module.exports = sendMessage;
