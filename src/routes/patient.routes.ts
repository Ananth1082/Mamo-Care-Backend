import Elysia, { t } from "elysia";
import { db } from "../db";
import { bgTypes, Patient } from "../types/types";
import {
  createPatient,
  deletePatient,
  getAllPatient,
  getPatientById,
  updatePatient,
} from "../controllers/patient.controllers";

export const patientRoutes = () => (app: Elysia) =>
  app.group("/patient", (app) =>
    app
      .get("/:id", ({ params }) => getPatientById(params))

      .get("/", () => getAllPatient())

      .post("/", ({ body }) => createPatient(body), {
        body: Patient,
      })

      .put("/:ip_number", ({ params, body }) => updatePatient(params, body), {
        body: t.Object(
          {
            name: t.Optional(t.String()),
            phone_number: t.Optional(t.String()),
            blood_group: t.Optional(bgTypes),
          },
          {
            minProperties: 1,
          }
        ),
      })

      .delete("/", ({ body }) => deletePatient(body), {
        body: t.Object({
          ip_number: t.String(),
        }),
      })
  );
