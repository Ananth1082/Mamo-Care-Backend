import { PrismaClient } from "@prisma/client";
import { Elysia, t } from "elysia";
import { bgTypes } from "./types/types";
const db = new PrismaClient();

new Elysia()
  .group("/api", (app) =>
    app
      .get("/", () => {
        return { name: "Elysia", version: "1.0.0" };
      })
      .group("/patient", (app) =>
        app
          .get("/patients", async () => {
            let patients = await db.patient.findMany();
            return patients;
          })

          .get("/patient/:id", async ({ params: { id } }) => {
            return await db.patient.findFirst({
              where: {
                id: id,
              },
            });
          })

          .post(
            "/patient",
            ({ body }) => {
              db.patient.create({
                data: body,
              });
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
            "/patient/:id",
            ({ params, body }) => {
              const { id } = params;
              const { name, phone_number, blood_group } = body;
              try {
                db.patient.update({
                  where: {
                    id: id,
                  },
                  data: {
                    ...(id ? { id } : {}),
                    ...(name ? { name } : {}),
                    ...(phone_number ? { phone_number } : {}),
                    ...(blood_group ? { blood_group } : {}),
                  },
                });
              } catch (err: unknown) {
                console.log(`Error occured while updating ${err}`);
              }
            },
            {
              body: t.Object(
                {
                  id: t.String(),
                  name: t.String(),
                  phone_number: t.String(),
                  blood_group: bgTypes,
                },
                {
                  minProperties: 1,
                }
              ),
            }
          )

          .delete(
            "/patient",
            ({ body }) => {
              const { id } = body;
              db.patient.delete({
                where: {
                  id,
                },
              });
            },
            {
              body: t.Object({
                id: t.String(),
              }),
            }
          )
      )
  )

  .listen(3000);
console.log(`Elysia is running at localhost:8080`);
