import Elysia, { t } from "elysia";
import { Medication } from "../types/types";
import {
  createMedication,
  createPrescription,
  deleteMedication,
  deletePrescription,
  getAllMedications,
  getMedicationByID,
  getMedicationByPatient,
  updateMedication,
} from "../controllers/medication.controllers";
import { checkDoctor, checkUserOrDoctor } from "../middleware/check_user";
import { JWTFilter } from "../middleware/jwt_filter";
import { db } from "../db";

export const medicationRoutes = () => (app: Elysia) =>
  app.group("/medication", (app) =>
    app
      .derive(JWTFilter)
      .get("/", getAllMedications, {
        beforeHandle: checkDoctor,
      })
      .get("/:id/:user-id", ({ params }) => getMedicationByID(params), {
        params: t.Object({
          id: t.Numeric(),
          user_id: t.String(),
        }),
        beforeHandle: checkUserOrDoctor,
      })
      .get(
        "/patient/:patient_id",
        ({ params }) => getMedicationByPatient(params),
        {
          params: t.Object({
            patient_id: t.String(),
          }),
          beforeHandle: checkUserOrDoctor,
        }
      )
      //adding a tablet to the prescription
      .post("/", ({ body }) => createMedication(body), {
        body: Medication,
        beforeHandle: checkDoctor,
      })
      //create a
      .post("/patient", ({ body }) => createPrescription(body), {
        body: t.Object({
          prescription: t.Array(Medication),
        }),
        beforeHandle: checkDoctor,
      })
      .put("/:id", ({ body, params }) => updateMedication(params, body), {
        params: t.Object({
          id: t.Numeric(),
        }),
        body: Medication,
        beforeHandle: checkDoctor,
      })
      //delete a prescription of a tablet
      .delete("/", ({ body }) => deleteMedication(body), {
        body: t.Object({
          id: t.Numeric(),
        }),
        beforeHandle: checkDoctor,
      })
      //delete a patient prescription
      .delete("/patient", ({ body }) => deletePrescription(body), {
        body: t.Object({
          patient_id: t.String(),
        }),
        beforeHandle: checkDoctor,
      })
  );
