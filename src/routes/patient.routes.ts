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
import { JWTFilter } from "../middleware/jwt_filter";
import { checkDoctor } from "../middleware/check_user";

export const patientRoutes = () => (app: Elysia) =>
  app.group("/patient", (app) =>
    app
      .derive(JWTFilter)
      .get("/:id", ({ params }) => getPatientById(params), {
        beforeHandle: checkDoctor,
      })

      .get("/", () => getAllPatient(), {
        beforeHandle: checkDoctor,
      })

      .post("/", ({ body }) => createPatient(body), {
        body: Patient,
        beforeHandle: checkDoctor,
      })

      .put(
        "/:ip_number",
        ({ params, body }) => {
          return updatePatient(params, body);
        },
        {
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
          beforeHandle: checkDoctor,
        }
      )

      .delete("/:ip_number", ({ params }) => deletePatient(params), {
        beforeHandle: checkDoctor,
      })
  );
