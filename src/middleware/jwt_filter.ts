import Jwt from "jsonwebtoken";

export interface payload {
  readonly phone_number: string;
  readonly session_id: string;
  readonly user_id: string;
  readonly role: "Doctor" | "Patient";
}

function filter(token: string) {
  const secretToken = process.env.JWT_SECRET || "mamo-care";
  const payload = Jwt.verify(token, secretToken) as payload;
  return payload;
}

export const JWTFilter = ({ headers }: Record<string, any>) => {
  const authHeader = headers["authorization"];
  if (!authHeader) {
    throw new Error("Auth header missing");
  }
  const token = authHeader.split(" ")[1];
  const payload = filter(token);
  return {
    jwt_payload: payload,
  };
};
