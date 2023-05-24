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

router.post("/", (req, res) => {
  const { phoneNumber, text } = req.body;
  let orderData = {};
  let response = "";
  let textArr = text.split("*");
  let currentUser = null;

  //check whether user already registered
  if (text == "") {
    Patient.findOne({ phone: phoneNumber })
      .then((user) => {
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
      })
      .catch((error) => {
        response = "END There was an error. Try again.";
      });
  }

  //select facilities
  else if (text == "1") {
    const canOrder = new Date(currentUser.next_order) < new Date();
    if (canOrder) {
      const data = facilities
        .map((facility, i) => {
          return `${i + 1} : ${facility.name} \n`;
        })
        .join(" ");
      response = `CON Select your facility. \n ${data}`;
    } else {
      response = `END You will make next order from  ${new Date(
        currentUser.next_order
      )}`;
    }
  }

  //show user orders
  else if (text == "2") {
    Order.find({ client: phoneNumber }).then((orders) => {
      const data = orders
        .map((order) => {
          return `OrderID : ${order.orderId} \n Delivery Fee : Ksh ${
            order.delivery_fee
          } \n Status : ${order.status} \n Date : ${dayjs(
            order.orderDate
          ).format("DD/MM/YYYY HH:mm")} \n\n`;
        })
        .join(" ");
      response = `END Recent orders. \n ${data}`;
    });
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

    const facilility = facilities.find(
      (f, i) => i === parseInt(text.split("*")[1]) - 1
    );
    orderData = { ...orderData, facilility: facilility.name };
    response = `CON Select preferred courier. \n ${data}`;
  }

  //enter delivery address
  else if (textArr.length === 3) {
    const courier = couriers.find(
      (c, i) => i === parseInt(text.split("*")[2]) - 1
    );
    orderData = { ...orderData, courier };
    response = `CON Enter delivery address. \n`;
  }

  //enter order deliver by date
  else if (textArr.length === 4) {
    orderData = { ...orderData, address: textArr[3] };
    response = `CON Enter latest delivery date. \n Format - (DD/MM/YYYY). \n`;
  }

  //enter order deliver by date
  else if (textArr.length === 5) {
    orderData = { ...orderData, deliveryDate: textArr[4] };
    response = `CON How long will this refill serve you? (in days). \n`;
  }

  //placing the order
  else if (textArr.length === 6) {
    orderData = {
      ...orderData,
      span: parseInt(textArr[5]),
      client: phoneNumber,
    };
    //make order
    const orderId = generateOrderId();
    Order.create({
      client: phonenumber,
      orderId,
      address: orderData.address,
      courier: orderData.courier,
      deliverBy: orderData.deliverBy,
      span: orderData.span,
      facility: orderData.facility,
    });

    //edit patient
    Patient.findByIdAndUpdate(
      currentUser._id,
      {
        can_order: false,
        last_order: Date.now(),
        next_order: getUserNextOrderDate(span),
      },
      { new: true }
    );
    const message = `Your order with orderID ${orderId} has been placed successfully. \n Awaiting delivery.`;
    sendMessage(message, phoneNumber);
    console.log(orderData);
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
