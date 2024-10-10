import express from "express";
import { randomUUID } from "crypto";
import { config } from "dotenv";
import { UserDetail } from "otpless-node-js-auth-sdk";

const app = express();
app.use(express.json());
config()
app.post("/api/auth/send-otp", async (req, res) => {
  const { phone_number } = req.body;
  console.log("Recieved phone: " + phone_number);

  const orderId = randomUUID();
  const clientID = process.env.OTPLESS_CLIENT_ID;
  const clientSecret = process.env.OTPLESS_CLIENT_SECRET;
  const hash = process.env.OTPLESS_HASH;
  console.log(clientID, orderId, clientSecret);

  try {
    const sendOTP = await UserDetail.sendOTP(
      phone_number,
      "",
      "WHATSAPP",
      hash,
      orderId,
      "60",
      "5",
      clientID,
      clientSecret
    );
    console.log("send otp response:", sendOTP);
    res.send(sendOTP);
  } catch (error) {
    console.error("Error:", JSON.stringify(error));
    res.json(error);
  }
});

app.listen("8090", () => {
  console.log("Server listening at port 8090");
});
