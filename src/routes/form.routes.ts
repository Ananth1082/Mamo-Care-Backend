import Elysia, { t } from "elysia";
import {
  createForm,
  deleteForm,
  getAllForms,
  getFormByID,
  getFormByUserAndTime,
} from "../controllers/form.controllers";
import { MedicalForm } from "../types/types";
import { JWTFilter } from "../middleware/jwt_filter";
import { checkDoctor, checkUser } from "../middleware/check_user";

export const formRoutes = () => (app: Elysia) =>
  app.group("/form", (app) =>
    app
      .derive(JWTFilter)
      .get("/", () => getAllForms(), {
        beforeHandle: checkDoctor,
      })

      .get("/form/:fid", ({ params }) => getFormByID(params), {
        params: t.Object({
          fid: t.Numeric(),
        }),
        beforeHandle: checkDoctor,
      })

      .get("/form/patient/:pid/time/:time", getFormByUserAndTime, {
        beforeHandle: checkDoctor,
      })

      .post("/form/:user_id", ({ body }) => createForm(body), {
        body: MedicalForm,
        beforeHandle: checkUser,
      })

      .delete("/form", ({ body }) => deleteForm(body), {
        body: t.Object({
          id: t.Number(),
        }),
        beforeHandle: checkDoctor,
      })
  );
