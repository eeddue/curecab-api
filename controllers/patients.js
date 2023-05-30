const bcrypt = require("bcryptjs");
const Patient = require("../models/patient");
const { decodeToken, createToken } = require("../lib/jwt");
const sendMessage = require("../lib/sms");
const EMR_Patients = require("../lib/EMR_Patients");

const validatePatient = async (req, res) => {
  const { ccc_no } = req.body;
  try {
    let user = await Patient.findOne({ ccc_no });
    if (user)
      return res
        .status(404)
        .json({ msg: "This CCC number has already been registered." });

    user = EMR_Patients.find((p) => p.ccc_no === ccc_no);
    if (!user) return res.status(404).json({ msg: "Invalid CCC number." });

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const registerPatient = async (req, res) => {
  const { full_name, phone, ccc_no, facility, password, id_no, photoUrl } =
    req.body;
  try {
    let user = await Patient.findOne({ ccc_no });
    if (user)
      return res
        .status(404)
        .json({ msg: "This CCC number has already been registered." });

    user = await Patient.findOne({ phone });
    if (user)
      return res
        .status(404)
        .json({ msg: "This phone number has already been registered." });

    user = EMR_Patients.find((p) => p.ccc_no === ccc_no);
    if (user.id_no !== id_no)
      return res.status(404).json({ msg: "Wrong ID number." });

    await Patient.create({
      full_name,
      phone,
      ccc_no,
      facility,
      password: bcrypt.hashSync(password, 10),
      photoUrl,
    });

    return res
      .status(200)
      .json({ msg: "You have been registered successfully." });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const loginPatient = async (req, res) => {
  const { phone, password: userPass } = req.body;
  try {
    let user = await Patient.findOne({ phone });
    if (!user) return res.status(404).json({ msg: "Wrong credentials." });

    const matchPassword = bcrypt.compareSync(userPass, user.password);
    if (!matchPassword)
      return res.status(404).json({ msg: "Wrong credentials." });

    const { password, ...userData } = user._doc;
    return res
      .status(200)
      .json({ user: userData, msg: "You are now loggedd in." });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { phone, ccc_no } = req.body;
  try {
    const user1 = await Patient.findOne({ ccc_no });
    if (!user1) return res.status(404).json({ msg: "Invalid credentials." });

    const user2 = await Patient.findOne({ phone });
    if (!user2)
      return res
        .status(404)
        .json({ msg: "This phone number is not yet registered." });

    if (user1.phone !== phone)
      return res
        .status(404)
        .json({ msg: "Details you provided aren't used by the same account." });

    const token = createToken({ userId: user1._id });
    const link = `http://localhost:5173/reset-password?token=${token}`;
    const message = `Click this link to reset your password. \n ${link}`;
    sendMessage(phone, message);

    return res
      .status(200)
      .json({ msg: "we've sent a password reset link to " + phone });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const decoded = decodeToken(token);
    const user = await Patient.findByIdAndUpdate(decoded.userId, {
      password: bcrypt.hashSync(password, 10),
    });

    return res.status(200).json({
      msg: "Your password has been updated successfully. Continue to login.",
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body);

    return res.status(200).json({
      patient,
      msg: "Patient updated successfully.",
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({});

    return res.status(200).json({
      patients,
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId);

    const { password, ...userData } = patient._doc;
    return res.status(200).json({
      patient: userData,
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  registerPatient,
  validatePatient,
  loginPatient,
  resetPassword,
  forgotPassword,
  updatePatient,
  getPatients,
  getPatient,
};
