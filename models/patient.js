const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema({
  full_name: String,
  next_order: {
    type: Date,
    default: null,
  },
  last_order: {
    type: Date,
    default: null,
  },
  can_order: {
    type: Boolean,
    default: true,
  },
  ccc_no: {
    type: String,
    unique: true,
  },
  phone: String,
  password: String,
  facility: String,
  photoUrl : String
});

const Patient = mongoose.model("Patients", PatientSchema);
module.exports = Patient;
