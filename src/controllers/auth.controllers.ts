import { randomUUID, Verify } from "crypto";
import { JwtPayload, sign, verify } from "jsonwebtoken";
//@ts-ignore
import { UserDetail } from "otpless-node-js-auth-sdk";
import { db } from "../db";

export async function sendOTP(body: { phone_number: string }) {
  const { phone_number } = body;
  const orderId = randomUUID();
  const clientID = process.env.OTPLESS_CLIENT_ID;
  const clientSecret = process.env.OTPLESS_CLIENT_SECRET;
  const hash = process.env.OTPLESS_HASH;
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
    const verifyToken = sign(
      {
        phone_number,
        tokenId,
      },
      verifySecret
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
      session_id: sess_data.id,
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
      token_id: sess_data.id,
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
  console.log(sessId);

  return {
    msg: "Successfully logged out of device",
  };
}
