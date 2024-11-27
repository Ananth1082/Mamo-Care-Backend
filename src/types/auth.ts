import { t } from "elysia";

export const VerifyOTPReqBody = t.Object({
  phone_number: t.String(),
  otp: t.String(),
  order_id: t.String(),
});

export const JWTHeader = t.Object({
  authorization: t.String(),
});
