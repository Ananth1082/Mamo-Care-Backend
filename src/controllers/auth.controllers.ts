import { randomUUID } from "crypto";
import { JwtPayload, sign, verify } from "jsonwebtoken";
//@ts-ignore
import { UserDetail } from "otpless-node-js-auth-sdk";
import { db } from "../db";
import { BadRequestError, InvalidRequestError } from "../Errors/user.error";

export async function sendOTP(body: { phone_number: string }) {
  const { phone_number } = body;

  const clientID = process.env.OTPLESS_CLIENT_ID;
  const clientSecret = process.env.OTPLESS_CLIENT_SECRET;
  const hash = process.env.OTPLESS_HASH;
  const channel = process.env.OTPLESS_CHANNEL;
  const expiry = process.env.OTP_EXPIRY;
  const digits = process.env.OTP_DIGITS;

  const orderId = randomUUID();

  const sendOTP = await UserDetail.sendOTP(
    phone_number,
    "",
    channel,
    hash,
    orderId,
    expiry,
    digits,
    clientID,
    clientSecret
  );
  console.log("send otp response:", sendOTP);
  return {
    msg: "otp sent successfully",
    order_id: orderId,
  };
}

interface verifyOTPBody {
  phone_number: string;
  otp: string;
  order_id: string;
}

export async function verifyPhoneNumber(body: verifyOTPBody) {
  const { phone_number, otp, order_id } = body;
  const clientID = process.env.OTPLESS_CLIENT_ID;
  const clientSecret = process.env.OTPLESS_CLIENT_SECRET;
  const response = await UserDetail.verifyOTP(
    "",
    phone_number,
    order_id,
    otp,
    clientID,
    clientSecret
  );

  if (response.isOTPVerified) {
    const verifySecret = process.env.VERIFY_SECRET || "mamo-care";
    const tokenId = randomUUID();
    //generate a verification token with an expiry of 5min
    const verifyToken = sign(
      {
        phone_number,
        tokenId,
      },
      verifySecret,
      {
        expiresIn: process.env.VERIFY_TKN_EXPIRY,
      }
    );

    return {
      msg: "verification successful",
      verification_token: verifyToken,
    };
  } else {
    throw new BadRequestError("Invalid otp");
  }
}

export async function signIn(verifyTkn: string) {
  //verify the token
  const verifySecret = process.env.VERIFY_SECRET;
  if (!verifySecret) {
    throw new BadRequestError("no verification token provided");
  }
  const payload = verify(verifyTkn, verifySecret) as JwtPayload;

  //find the user with the phone number else throw error
  const data = await db.user.findUniqueOrThrow({
    where: {
      phone_number: payload["phone_number"],
    },
    select: {
      id: true,
      role: true,
    },
  });

  //create a log of the session
  const sess_data = await db.session.create({
    data: {
      user_id: data.id,
    },
    select: {
      id: true,
    },
  });
  const sessSecret = process.env.JWT_SECRET || "mamo-care";

  const token = sign(
    {
      phone_number: payload["phone_number"],
      user_id: data.id,
      session_id: sess_data.id,
      role: data.role,
    },
    sessSecret
  );
  return {
    msg: "signed in successfully",
    token,
  };
}

export async function signup(verifyTkn: string, ipNumber: string | undefined) {
  //verify the token
  const verifySecret = process.env.VERIFY_SECRET;
  if (!verifySecret) {
    throw new BadRequestError("no verification token provided");
  }
  const payload = verify(verifyTkn, verifySecret) as JwtPayload;

  //find the user with the phone number else throw error
  const data = await db.user.findUnique({
    where: {
      phone_number: payload["phone_number"],
    },
    select: {
      id: true,
    },
  });

  if (data) {
    throw new InvalidRequestError("user already exists");
  }

  const user = await db.user.create({
    data: {
      role: "Patient",
      phone_number: payload["phone_number"],
    },
  });

  if (ipNumber) {
    const patient = await db.patient.update({
      where: {
        ip_number: ipNumber,
      },
      data: {
        user_id: user.id,
      },
    });
  }

  //create a log of the session
  const sess_data = await db.session.create({
    data: {
      user_id: user.id,
    },
    select: {
      id: true,
    },
  });
  const sessSecret = process.env.JWT_SECRET || "mamo-care";

  const token = sign(
    {
      phone_number: payload["phone_number"],
      user_id: user.id,
      session_id: sess_data.id,
    },
    sessSecret
  );
  return {
    msg: "signed up successfully",
    token,
  };
}

export async function logout(sessId: string) {
  await db.session.update({
    where: {
      id: sessId,
    },
    data: {
      is_active: false,
    },
  });

  return {
    msg: "Successfully logged out of device",
  };
}
