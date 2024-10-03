import { PrismaClient } from "@prisma/client";
import { logger } from "@tqman/nice-logger";
import { Elysia, t } from "elysia";
import { bgTypes } from "./types/types";
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
  )

  .listen(3000);
console.log(`Elysia is running at localhost:3000`);
