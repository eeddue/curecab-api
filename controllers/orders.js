const Patient = require("../models/patient");
const sendMessage = require("../lib/sms");
const Order = require("../models/order");

const makeOrder = async (req, res) => {
  const {
    client,
    orderId,
    address,
    courier,
    deliverBy,
    userId,
    next_order,
    span,
    facility,
    photoUrl,
  } = req.body;
  try {
    let user = await Patient.findOne({ phone: client });
    if (new Date(user.next_order) > new Date())
      return res.status(400).json({
        msg: `You next order will be made from ${new Date(user.next_order)}`,
      });

    const order = await Order.create({
      client,
      orderId,
      address,
      courier,
      deliverBy,
      span,
      facility,
      photoUrl,
    });

    user = await Patient.findByIdAndUpdate(
      userId,
      {
        can_order: false,
        last_order: Date.now(),
        next_order,
      },
      { new: true }
    );

    const { password, ...userData } = user._doc;

    //send message to the patient
    sendMessage(
      "+254114357926",
      `Your order ${orderId} has been made successfully. Awaiting approval and delivery.`
    );
    //send message to the clinician
    sendMessage(
      "+254114357926",
      `A new order with order ID - ${orderId} has been made. Login to the dashboard for approval and processing.`
    );

    return res.status(200).json({
      msg: `Your order ${orderId} has been made successfully. Awaiting approval and delivery.`,
      user: userData,
      order,
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const updateOrder = async (req, res) => {
  const { delivery_fee, initialFee, next_order, initial_next_order, userId } =
    req.body;
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    // const isDateChanged =
    //   new Date(next_order).getDate() !== new Date(initial_next_order).getDate();
    // if (isDateChanged) {
    //   await Patient.findByIdAndUpdate(userId, {
    //     next_order: new Date(next_order),
    //   });
    //   sendMessage(
    //     "+254114357926",
    //     `Your order has been confirmed. Due to pills shortage, we can only provide pills to cover you upto ${new Date(
    //       next_order
    //     )}. We apologize for our inconveniences.`
    //   );
    // }

    if (delivery_fee !== initialFee) {
      sendMessage(
        "+254114357926",
        `Your order has been confirmed. Your total delivery fee is Ksh ${req.body.delivery_fee}. Your order is now on transit.`
      );
    }

    return res.status(200).json({
      msg: "Order updated successfully.",
      order,
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const patientOrders = async (req, res) => {
  try {
    const orders = await Order.find({ client: req.params.client });
    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const clinicianOrders = async (req, res) => {
  const { isAdmin, facility } = req.params.data;
  try {
    let orders;
    if (isAdmin) {
      orders = await Order.find({});
    } else {
      orders = await Order.find({ facility });
    }
    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

module.exports = { makeOrder, updateOrder, patientOrders, clinicianOrders };
