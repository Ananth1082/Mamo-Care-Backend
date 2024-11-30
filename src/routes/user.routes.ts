import Elysia from "elysia";
import { getUserProfile } from "../controllers/user.controllers";
import { JWTFilter } from "../middleware/jwt_filter";
import { logout } from "../controllers/auth.controllers";

export const userRoutes = () => (app: Elysia) =>
  app.group("/user", (app) =>
    app
      .get("/profile/:id", async ({ set, params }) => {
        const { id } = params;
        try {
          return await getUserProfile(id);
        } catch (error) {
          set.status = 404;
          return {
            msg: "error",
            error: "Invalid user id",
          };
        }
      })
      .derive(JWTFilter)
      .get("/profile", async ({ jwt_payload }) => {
        const user_id = jwt_payload.user_id;
        try {
          return await getUserProfile(user_id);
        } catch (error) {
          return {
            msg: "error",
            error: "Invalid user id",
          };
        }
      })
      // .put("/profile", ({ set, jwt_payload }) => {})
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
      })
  );
