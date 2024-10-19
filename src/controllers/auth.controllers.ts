import { randomUUID } from "crypto";
import { JwtPayload, sign, verify } from "jsonwebtoken";
//@ts-ignore
import { UserDetail } from "otpless-node-js-auth-sdk";
import { db } from "../db";
import { InvalidPhoneError, UnauthorizedError } from "../Errors/user.error";

export async function sendOTP(body: { phone_number: string }) {
  const { phone_number } = body;
  const orderId = randomUUID();
  const clientID = process.env.OTPLESS_CLIENT_ID;
  const clientSecret = process.env.OTPLESS_CLIENT_SECRET;
  const hash = process.env.OTPLESS_HASH;
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
    return orderId;
  } catch (error: unknown) {
    console.error("Error:", JSON.stringify(error));
    return JSON.stringify(error);
  }
}

interface verifyOTPBody {
  user: { phone_number: string; ip_number?: string };
  otp: string;
  order_id: string;
}

export async function verifyOTP(
  body: verifyOTPBody,
  query: { isDoctor?: boolean }
) {
  const { user, order_id, otp } = body;
  const clientID = process.env.OTPLESS_CLIENT_ID;
  const clientSecret = process.env.OTPLESS_CLIENT_SECRET;
  const { isDoctor } = query;
  try {
    const response = await UserDetail.verifyOTP(
      "",
      user.phone_number,
      order_id,
      otp,
      clientID,
      clientSecret
    );

    if (response.isOTPVerified) {
      const new_user = await db.user.create({
        data: {
          role: isDoctor ? "Doctor" : "Patient",
          phone_number: user.phone_number,
        },
      });

      if (isDoctor) {
        const doctor = await db.doctor.update({
          data: {
            doctor_id: new_user.id,
          },
          where: {
            phone_number: user.phone_number,
          },
        });
        if (!doctor) {
          throw InvalidPhoneError;
        }
        return new Response(JSON.stringify(doctor), {
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      const patient = await db.patient.findFirst({
        where: {
          ip_number: user.ip_number,
        },
      });
      if (patient) {
        await db.patient.update({
          data: {
            user_id: new_user.id,
          },
          where: {
            ip_number: user.ip_number,
          },
        });
        const secret = process.env.JWT_SECRET || "secret";
        const sessionId = randomUUID();
        const token = sign(
          { user_id: new_user.id, session_id: sessionId },
          secret
        );
        await db.session.create({
          data: {
            hashtoken: token,
            user_id: new_user.id,
            id: sessionId,
          },
        });
        return new Response(
          JSON.stringify({ otp: response, user: new_user, token: token }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      } else {
        throw new Error("Patient not registered ask your doctor");
      }
    } else {
      return { otp: response, user: "not created" };
    }
  } catch (error) {
    return JSON.stringify(error);
  }
}

export async function getSession(headers: Record<string, string | undefined>) {
  try {
    const authHeader = headers.authorization;
    if (!authHeader) {
      throw UnauthorizedError;
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "secret";
    let res = verify(token, secret) as JwtPayload;
    const session = db.session.findFirst({
      where: {
        id: res.session_id,
      },
    });
    return session;
  } catch (error: unknown) {
    console.error(error);
    return JSON.stringify(error);
  }
}

export async function logout(headers: Record<string, string | undefined>) {
  try {
    const authHeader = headers.authorization;
    if (!authHeader) {
      throw new Error("Unauthorized! enter a token");
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "secret";
    let res = verify(token, secret) as JwtPayload;
    const patient = await db.session.update({
      where: {
        id: res["session_id"],
      },
      data: {
        is_active: false,
      },
    });
    console.log(res["id"]);

    return {
      msg: "Successfully logged out of device",
      session: patient,
    };
  } catch (error: unknown) {
    throw new Error("Error logging out " + JSON.stringify(error));
  }
}
