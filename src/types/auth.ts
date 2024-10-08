import { t } from "elysia";

export const VerifyOTPReqBody = t.Object({
  user: t.Object({
    phone_number: t.String(),
    ip_number: t.Optional(t.String()),
  }),
  otp: t.String(),
  order_id: t.String(),
});

export const JWTHeader = t.Object({
  authorization: t.String(),
});
