import Elysia, { t } from "elysia";
import {
  verifyPhoneNumber,
  signIn,
  signup,
} from "../controllers/auth.controllers";

import { VerifyOTPReqBody, JWTHeader } from "../types/auth";

export const authRoutes = () => (app: Elysia) =>
  app
    .group("/auth", (app) =>
      app
        .post(
          "/verify-otp",
          ({ body, set }) => {
            set.headers["content-type"] = "text/json";
            try {
              const res = verifyPhoneNumber(body);
              set.status = 200;
              return res;
            } catch (error: unknown) {
              set.status = 404;
              return {
                msg: "verification failed",
                error,
              };
            }
          },
          {
            body: VerifyOTPReqBody,
          }
        )
        .post(
          "/signin",
          ({ body }) => {
            const { verification_token } = body;
            return signIn(verification_token);
          },
          {
            body: t.Object({
              verification_token: t.String(),
            }),
          }
        )
        .post(
          "/signup",
          ({ body }) => {
            const { verification_token, ip_number } = body;
            return signup(verification_token, ip_number);
          },
          {
            body: t.Object({
              ip_number: t.Optional(t.String()),
              verification_token: t.String(),
            }),
          }
        )
    )
    ;
