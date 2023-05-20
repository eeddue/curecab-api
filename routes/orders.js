const {
  updateOrder,
  patientOrders,
  clinicianOrders,
} = require("../controllers/orders");
const { makeOrder } = require("../controllers/orders");

const router = require("express").Router();
//make order
router.post("/make", makeOrder);

//edit order
router.patch("/update/:id", updateOrder);

//patient orders
router.get("/patient/:client", patientOrders);

//clinician orders
router.get("/clinicians/:data", clinicianOrders);

module.exports = router;
