import { PrismaClient } from "@prisma/client";
import { logger } from "@tqman/nice-logger";
import { Elysia, t } from "elysia";
import { bgTypes, Medication } from "./types/types";
import { parseArgs } from "util";
import { removeUndefinedValues } from "../utils/filterObject";
const db = new PrismaClient();

new Elysia()
  .use(
    logger({
      mode: "live", // "live" or "combined" (default: "combined")
    })
  )
  .group("/api", (app) =>
    app
      .get("/", () => {
        return { name: "Elysia", version: "1.0.0" };
      })
      .group("/patient", (app) =>
        app
          .get("/", async () => {
            let patients = await db.patient.findMany();
            return patients;
          })

          .get("/:id", async ({ params: { id } }) => {
            return await db.patient.findFirst({
              where: {
                id: id,
              },
            });
          })

          .post(
            "/",
            async ({ body }) => {
              const patient = await db.patient.create({
                data: body,
              });
              return { msg: "Created patient", patient };
            },
            {
              body: t.Object({
                id: t.String(),
                name: t.String(),
                phone_number: t.String(),
                blood_group: bgTypes,
              }),
            }
          )

          .put(
            "/:id",
            async ({ params, body }) => {
              const { id } = params;
              const { name, phone_number, blood_group } = body;
              try {
                const patient = await db.patient.update({
                  where: {
                    id,
                  },
                  data: {
                    ...(id ? { id } : {}),
                    ...(name ? { name } : {}),
                    ...(phone_number ? { phone_number } : {}),
                    ...(blood_group ? { blood_group } : {}),
                  },
                });
                return { msg: "updated user", patient };
              } catch (err: unknown) {
                console.log(`Error occured while updating ${err}`);
              }
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
            }
          )

          .delete(
            "/",
            async ({ body }) => {
              const { id } = body;
              const patient = await db.patient.delete({
                where: {
                  id,
                },
              });
              return { msg: "Deleted patient", patient };
            },
            {
              body: t.Object({
                id: t.String(),
              }),
            }
          )
      )
      //form routes
      .group("/form", (app) =>
        app
          .get("/", async () => {
            return await db.formResponse.findMany();
          })
          .get(
            "/form/:fid",
            async ({ params }) => {
              const { fid } = params;
              return await db.formResponse.findFirst({
                where: {
                  id: fid,
                },
              });
            },
            {
              params: t.Object({
                fid: t.Numeric(),
              }),
            }
          )
          .get("/form/:pid/:time", async ({ params }) => {
            const { pid, time } = params;
            return await db.formResponse.findFirst({
              where: {
                patient_id: pid,
                submitted_at: time,
              },
            });
          })
          .post(
            "/form",
            async ({ body }) => {
              return await db.formResponse.create({
                data: body,
              });
            },
            {
              body: t.Object({
                patient_id: t.String(),
                submitted_at: t.String(),
                question1: t.String(),
                question2: t.String(),
                question3: t.String(),
              }),
            }
          )
          .delete(
            "/form",
            ({ body }) => {
              const { id } = body;
              return db.formResponse.delete({
                where: {
                  id,
                },
              });
            },
            {
              body: t.Object({
                id: t.Number(),
              }),
            }
          )
      )
      .group("/medication", (app) =>
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
            "/patient/:pid",
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
      )
  )

  .listen(3000);
console.log(`Elysia is running at localhost:3000`);
