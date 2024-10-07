import { JwtPayload, verify } from "jsonwebtoken";
import { db } from "../db";

export async function CheckJWT(token: string) {
  try {
    const secret = process.env.JWT_SECRET || "secret";
    const res = verify(token, secret) as JwtPayload;
    
    const sessionCount = await db.session.count({
      where: {
        user_id: res.id,
      },
    });

    if (sessionCount !== 1) {
      throw new Error("Invalid access token.");
    }
  } catch (err: unknown) {
    console.error("Error checking token: " + err);
  }
}
