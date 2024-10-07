import Elysia, { t } from "elysia";
import { removeUndefinedValues } from "../../utils/filterObject";
import { db } from "../db";
import { Medication } from "../types/types";

export const medicationRoutes = () => (app: Elysia) =>
  app.group("/medication", (app) =>
    app
      .get("/", async () => {
        return await db.medication.findMany();
      })

      .get(
        "/:id",
        async ({ params }) => {
          const { id } = params;
          return await db.medication.findFirst({
            where: {
              id,
            },
          });
        },
        {
          params: t.Object({
            id: t.Numeric(),
          }),
        }
      )
      .get(
        "/patient/:patient_id",
        async ({ params }) => {
          const { patient_id } = params;
          return await db.medication.findMany({
            where: {
              patient_id,
            },
          });
        },
        {
          params: t.Object({
            patient_id: t.String(),
          }),
        }
      )
      //adding a tablet to the prescription
      .post(
        "/",
        async ({ body }) => {
          return await db.medication.create({
            data: body,
          });
        },
        {
          body: Medication,
        }
      )
      //create a
      .post(
        "/patient",
        async ({ body }) => {
          return db.medication.createMany({
            data: body.prescription,
          });
        },
        {
          body: t.Object({
            prescription: t.Array(Medication),
          }),
        }
      )
      .put(
        "/:id",
        async ({ params, body }) => {
          const { id } = params;
          return await db.medication.update({
            where: {
              id,
            },
            data: removeUndefinedValues(body),
          });
        },
        {
          params: t.Object({
            id: t.Numeric(),
          }),
          body: Medication,
        }
      )
      //delete a prescription of a tablet
      .delete(
        "/",
        async ({ body }) => {
          const { id } = body;
          try {
            return await db.medication.delete({
              where: {
                id,
              },
            });
          } catch (err: unknown) {
            console.log("Error occured while deleting " + err);
          }
        },
        {
          body: t.Object({
            id: t.Numeric(),
          }),
        }
      )
      //delete a patient prescription
      .delete(
        "/patient",
        ({ body }) => {
          const { patient_id } = body;
          try {
            return db.medication.deleteMany({
              where: {
                patient_id,
              },
            });
          } catch (error: unknown) {
            console.log(
              "Error occured while deleting patient medication " + error
            );
          }
        },
        {
          body: t.Object({
            patient_id: t.String(),
          }),
        }
      )
  );
