const mongoose = require("mongoose");

const ClinicianSchema = new mongoose.Schema({
  phone: String,
  full_name: String,
  facility: String,
  password: String,
  verified: {
    type: Boolean,
    default: false,
  },
  photoUrl: String,
  isAdmin: Boolean,
});

const Clinician = mongoose.model("Clinicians", ClinicianSchema);
module.exports = Clinician;
