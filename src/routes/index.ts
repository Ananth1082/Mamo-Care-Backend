import Elysia from "elysia";
import {  authRoutes } from "./auth.routes";
import { formRoutes } from "./form.routes";
import { medicationRoutes } from "./medication.routes";
import { patientRoutes } from "./patient.routes";
import { JWTFilter, payload } from "../middleware/jwt_filter";

interface AppContext {
  jwt_payload? : payload
}

export const routes = new Elysia().group("/api", (app) =>
  app
    .use(authRoutes())
    .use(patientRoutes())
    .use(formRoutes())
    .use(medicationRoutes())
);
