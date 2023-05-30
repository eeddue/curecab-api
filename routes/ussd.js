const router = require("express").Router();
const { facilities } = require("../lib/facilities");
const Greetings = require("../lib/greetings");
const Patient = require("../models/patient");
const Order = require("../models/order");
const { couriers } = require("../lib/couriers");
const generateOrderId = require("../lib/orderId");
const sendMessage = require("../lib/sms");

const getUserNextOrderDate = (days) => {
  const time = parseInt(days) * 24 * 60 * 60 * 1000;
  const next_date = new Date().getTime() + time;
  return next_date;
};

const getUser = async (phone) => {
  return await Patient.findOne({ phone });
};

router.post("/", async (req, res) => {
  const { phoneNumber, text } = req.body;
  let orderData = {};
  let response = "";
  let textArr = text.split("*");
  let user = await getUser(phoneNumber);

  //check whether user already registered
  if (text == "") {
    if (!user) {
      response = `END You are not yet registered. \n Use our website (curecab.com) or mobile app (Curecab) to register. \n`;
    } else {
      currentUser = user;
      response = `CON ${Greetings()} ${
        currentUser.full_name
      }. \n What can we do for you today? \n
              1. Make an order
              2. View recent orders
              3. Book an appointment`;
    }
  }

  //select facilities
  else if (text == "1") {
    user = await getUser(phoneNumber);
    const canOrder = new Date(user?.next_order) < new Date();
    if (canOrder) {
      const data = facilities
        .map((facility, i) => {
          return `${i + 1} : ${facility.name} \n`;
        })
        .join(" ");
      response = `CON Select your facility. \n ${data}`;
    } else {
      response = `END You will make next order from  ${new Date(
        user.next_order
      )}`;
    }
  }

  //show user orders
  else if (text == "2") {
    const orders = await Order.find({ client: phoneNumber });
    let data;
    if (orders.length > 0) {
      data = orders
        .sort((a, b) => {
          return new Date(b.orderDate) - new Date(a.orderDate);
        })
        .map((order, index) => {
          return `${index + 1} : ${order.status} - ${order.orderId}  \n\n`;
        })
        .join(" ");
    } else {
      data = "You have no recent orders.";
    }
    response = `CON Recent orders. \n ${data}`;
  }

  //book appointment
  else if (text == "3") {
    response = `END To book an appointment, use Nishauri from their website or their mobile app.\n Thank you.`;
  }

  //select couriers
  else if (textArr.length === 2) {
    const data = couriers
      .map((courier, i) => {
        return `${i + 1} : ${courier} \n`;
      })
      .join(" ");

    response = `CON Select preferred courier. \n ${data}`;
  }

  //enter delivery address
  else if (textArr.length === 3) {
    response = `CON Enter delivery address. \n`;
  }

  //enter order deliver by date
  else if (textArr.length === 4) {
    response = `CON How long will this refill serve you? (in days). \n`;
  }

  //placing the order
  else if (textArr.length === 5) {
    //make order
    const facility = facilities.find((f, i) => i === parseInt(textArr[1]) - 1);
    const courier = couriers.find((c, i) => i === parseInt(textArr[2]) - 1);
    const orderId = generateOrderId();

    await Order.create({
      client: phoneNumber,
      orderId,
      address: textArr[3],
      deliverBy: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
      span: parseInt(textArr[4]),
      courier,
      facility: facility.name,
    });

    //edit patient
    const user = await getUser(phoneNumber);
    await Patient.findByIdAndUpdate(
      user._id,
      {
        can_order: false,
        last_order: Date.now(),
        next_order: getUserNextOrderDate(parseInt(textArr[4])),
      },
      { new: true }
    );
    const message = `Your order with orderID ${orderId} has been placed successfully. \n Awaiting delivery.`;
    sendMessage(message, phoneNumber);
    response = `END Your order has been placed successfully. Awaiting confirmation and delivery. \n`;
  }

  //invalid selection
  else {
    response = `END Invalid select option.`;
  }

  res.set("Content-Type: text/plain");
  res.send(response);
});

module.exports = router;
