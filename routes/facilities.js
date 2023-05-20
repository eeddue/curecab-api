const router = require("express").Router();
const { facilities } = require("../lib/facilities");

router.get("/", (req, res) => {
  try {
    return res.status(200).json({ facilities });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

module.exports = router;
