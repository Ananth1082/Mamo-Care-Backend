import Elysia from "elysia";
import { authRoutes } from "./auth.routes";
import { formRoutes } from "./form.routes";
import { medicationRoutes } from "./medication.routes";
import { patientRoutes } from "./patient.routes";
import { userRoutes } from "./user.routes";

export const routes = new Elysia().group("/api", (app) =>
  app
    .use(userRoutes())
    .use(patientRoutes())
    .use(formRoutes())
    .use(medicationRoutes())
    .use(authRoutes())
);
