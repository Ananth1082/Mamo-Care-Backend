import Elysia, { t } from "elysia";
import {
  sendOTP,
  verifyOTP,
  getSession,
  logout,
} from "../controllers/auth.controllers";
import middleware from "../middleware";
import { VerifyOTPReqBody, JWTHeader } from "../types/auth";

export const authRoutes = () => (app: Elysia) =>
  app.group("/auth", (app) =>
    app
      // .post("/send-otp", ({ body }) => sendOTP(body), {
      //   body: t.Object({
      //     phone_number: t.String(),
      //   }),
      // })
      .post(
        "/verify-otp",
        ({ body, query, set }) => {
          set.headers["content-type"] = "text/json";
          return verifyOTP(body, query);
        },
        {
          body: VerifyOTPReqBody,
          query: t.Object({
            isDoctor: t.Optional(t.Boolean()),
          }),
        }
      )
      .guard({
        beforeHandle({ headers, set }) {
          const authHeader = headers["authorization"];
          if (!authHeader) {
            throw new Error("Auth header missing");
          }
          const token = authHeader.split(" ")[1];
          middleware.CheckJWT(token);
        },
      })

      .get("/get-session", ({ headers }) => {
        return getSession(headers);
      })

      .put(
        "/logout",
        ({ headers }) => {
          return logout(headers);
        },
        {
          headers: JWTHeader,
        }
      )

      
  );
