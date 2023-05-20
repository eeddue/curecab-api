const {
  registerClinician,
  loginClinician,
  verifyClinician,
  getClinicians,
  updateClinician,
  deleteClinician,
} = require("../controllers/clinicians");

const router = require("express").Router();

//register
router.post("/register", registerClinician);
router.post("/login", loginClinician);
router.patch("/verify", verifyClinician);
router.patch("/update", updateClinician);
router.patch("/delete", deleteClinician);
router.get("/", getClinicians);

module.exports = router;
