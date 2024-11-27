import { verify } from "jsonwebtoken";

export interface payload {
  phone_number : string;
  session_id : string;
}

export function filter(token : string) {
  const secretToken = process.env.JWT_SECRET|| 'mamo-care';
  const payload = verify(token,secretToken) as payload;
  return payload;
}

export const JWTFilter = ({ headers } : Record<string,any>) => {
  const authHeader = headers["authorization"];
  if (!authHeader) {
    throw new Error("Auth header missing");
  }
  const token = authHeader.split(" ")[1];
  const payload = filter(token);
  return {
    jwt_payload: payload,
  };
}