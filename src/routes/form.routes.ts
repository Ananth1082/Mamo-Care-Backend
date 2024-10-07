import Elysia, { t } from "elysia";
import {
  createForm,
  deleteForm,
  getAllForms,
  getFormByID,
  getFormByUserAndTime,
} from "../controllers/form.controllers";
import { MedicalForm } from "../types/types";

export const formRoutes = () => (app: Elysia) =>
  app.group("/form", (app) =>
    app
      .get("/", () => getAllForms())

      .get("/form/:fid", ({ params }) => getFormByID(params), {
        params: t.Object({
          fid: t.Numeric(),
        }),
      })

      .get("/form/patient/:pid/time/:time", getFormByUserAndTime)
      
      .post("/form", ({ body }) => createForm(body), {
        body: MedicalForm,
      })
      
      .delete("/form", ({ body }) => deleteForm(body), {
        body: t.Object({
          id: t.Number(),
        }),
      })
  );
