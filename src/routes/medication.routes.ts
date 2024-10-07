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

export const medicationRoutes = () => (app: Elysia) =>
  app.group("/medication", (app) =>
    app
      .get("/", getAllMedications)
      .get("/:id", ({ params }) => getMedicationByID(params), {
        params: t.Object({
          id: t.Numeric(),
        }),
      })
      .get(
        "/patient/:patient_id",
        ({ params }) => getMedicationByPatient(params),
        {
          params: t.Object({
            patient_id: t.String(),
          }),
        }
      )
      //adding a tablet to the prescription
      .post("/", ({ body }) => createMedication(body), {
        body: Medication,
      })
      //create a
      .post("/patient", ({ body }) => createPrescription(body), {
        body: t.Object({
          prescription: t.Array(Medication),
        }),
      })
      .put("/:id", ({ body, params }) => updateMedication(params,body), {
        params: t.Object({
          id: t.Numeric(),
        }),
        body: Medication,
      })
      //delete a prescription of a tablet
      .delete("/", ({ body }) => deleteMedication(body), {
        body: t.Object({
          id: t.Numeric(),
        }),
      })
      //delete a patient prescription
      .delete("/patient", ({ body }) => deletePrescription(body), {
        body: t.Object({
          patient_id: t.String(),
        }),
      })
  );
