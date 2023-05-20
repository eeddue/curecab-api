const router = require("express").Router();
const { couriers } = require("../lib/couriers");

router.get("/", async (req, res) => {
  try {
    return res.status(200).json({ couriers });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

module.exports = router;
