const { decodeToken, createToken } = require("../lib/jwt");
const sendMessage = require("../lib/sms");
const Clinician = require("../models/clinician");
const bcrypt = require("bcryptjs");

const registerClinician = async (req, res) => {
  const { facility, full_name, phone, photoUrl, email } = req.body;
  try {
    let user = await Clinician.findOne({ phone });
    if (user)
      return res.status(400).json({ msg: "Phone number already exists." });

    user = await Clinician.findOne({ email });
    if (user) return res.status(400).json({ msg: "Email already exists." });

    user = await Clinician.create({
      facility,
      full_name,
      phone,
      photoUrl,
      email,
      isAdmin: false,
    });

    const token = createToken({ userId: user._id });
    const link = `http://localhost:5173/verify?token=${token}`;
    const message = `Click this link to verify your curecab clinician account. \n ${link}`;

    sendMessage(phone, message);

    return res
      .status(200)
      .json({ msg: "Clinician added successfully.", link, token });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const loginClinician = async (req, res) => {
  const { email, password: userPass } = req.body;
  try {
    let user = await Clinician.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials." });

    const matchPassword = bcrypt.compareSync(userPass, user.password);
    if (!matchPassword)
      return res.status(400).json({ msg: "Invalid credentials." });

    if (!user.verified)
      return res.status(400).json({
        msg: "Account not verified. Click the link that was set to your phone number.",
      });

    const { password, ...userData } = user._doc;
    return res
      .status(200)
      .json({ msg: "You are now logged in.", user: userData });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const verifyClinician = async (req, res) => {
  const { token, password } = req.body;
  try {
    const decoded = decodeToken(token);
    const user = await Clinician.findByIdAndUpdate(decoded.userId, {
      password: bcrypt.hashSync(password, 10),
      verified: true,
    });

    return res
      .status(200)
      .json({ msg: "You are now verified. Continue to login.", user });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const getClinicians = async (req, res) => {
  try {
    const clinicians = await Clinician.find();

    return res.status(200).json({ clinicians });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const updateClinician = async (req, res) => {
  try {
    const clinician = await Clinician.findByIdAndUpdate(
      req.body.userId,
      req.body,
      { new: true }
    );

    const { password, ...userData } = clinician._doc;
    return res
      .status(200)
      .json({ msg: "Clinician updated successfully", clinician: userData });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const deleteClinician = async (req, res) => {
  try {
    await Clinician.findByIdAndDelete(req.body.userId);

    return res.status(200).json({ msg: "Clinician deleted successfully" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  registerClinician,
  loginClinician,
  verifyClinician,
  getClinicians,
  updateClinician,
  deleteClinician,
};
