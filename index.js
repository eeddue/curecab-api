require("dotenv").config();
const express = require("express");
const cors = require("cors");
const DbConnect = require("./lib/mongodb");
const app = express();
const port = 5000 || process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

//routes
app.use("/api/v1/patients", require("./routes/patients"));
app.use("/api/v1/orders", require("./routes/orders"));
app.use("/api/v1/clinicians", require("./routes/clinicians"));
app.use("/api/v1/couriers", require("./routes/couriers"));
app.use("/api/v1/facilities", require("./routes/facilities"));
app.use("/api/v1/ussd", require("./routes/ussd"));

app.get("/", (req, res) => {
  res.send("Server is running.");
});

app.listen(port, () => {
  DbConnect();
  console.log("Server running on port " + port);
});
