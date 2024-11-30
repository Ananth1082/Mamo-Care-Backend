import Elysia from "elysia";
import { getUserProfile } from "../controllers/user.controllers";
import { JWTFilter } from "../middleware/jwt_filter";
import { logout } from "../controllers/auth.controllers";

export const userRoutes = () => (app: Elysia) =>
  app.group("/user", (app) =>
    app
    .get("/profile/:id", async ({ params }) => {
      const { id } = params;
      try {
        return await getUserProfile(id);
      } catch (error) {
        return {
          msg: "error",
          error: "Invalid user id",
        };
      }
    })
    .derive(JWTFilter)
    .put("/profile",({set,jwt_payload})=>{
      
    })
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
