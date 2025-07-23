import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = new User({
    username: "admin",
    password: "12345678",
    name: "admin ",
    phoneNumber: "0123456789",
    role: "admin",
  });
  await user.save();
  console.log("User user created");
  process.exit();
});
