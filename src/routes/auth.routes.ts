import Elysia, { t } from "elysia";
import {
  sendOTP,
  logout,
  verifyPhoneNumber,
  signIn,
  signup,
} from "../controllers/auth.controllers";

import { VerifyOTPReqBody, JWTHeader } from "../types/auth";
import { JWTFilter, payload } from "../middleware/jwt_filter";

export const authRoutes = () => (app: Elysia) =>
  app
    .group("/auth", (app) =>
      app
        // .post("/send-otp", ({ body }) => sendOTP(body), {
        //   body: t.Object({
        //     phone_number: t.String(),
        //   }),
        // })
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
              // ip_number: t.String(),
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
    .derive(JWTFilter)
    .put("/logout", ({ set, jwt_payload }) => {
      try {
        set.status = 200;
        return logout(jwt_payload.session_id);
      } catch (error) {
        return {
          msg: "Logout error",
          error,
        };
      }
    });
