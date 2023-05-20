const {
  registerPatient,
  validatePatient,
  forgotPassword,
  loginPatient,
  resetPassword,
  updatePatient,
  getPatients,
} = require("../controllers/patients");

const router = require("express").Router();

//register
router.post("/validate", validatePatient);
router.post("/register", registerPatient);
router.post("/login", loginPatient);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password", resetPassword);
router.patch("/update/:id", updatePatient);
router.get("/", getPatients);

module.exports = router;
