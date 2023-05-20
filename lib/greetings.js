//get time greeting
const Greetings = () => {
  let today = new Date();
  let hourNow = today.getHours();

  if (hourNow >= 0 && hourNow < 12) return "Good morning";
  if (hourNow >= 12 && hourNow < 18) return "Good afternoon";
  return "Good evening";
};

module.exports = Greetings;
