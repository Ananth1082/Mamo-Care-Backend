import Elysia, { t } from "elysia";
import { db } from "../db";
import { bgTypes } from "../types/types";

export const patientRoutes = new Elysia().group("/patient", (app) =>
  app
    .get("/:id", async ({ params: { id } }) => {
      try {
        const patient = await db.patient.findFirst({
          where: {
            ip_number: id,
          },
        });
        if (patient) {
          return patient;
        } else {
          throw new Error("Invalid ip number");
        }
      } catch (err: unknown) {
        console.error(err);
        return { err: "Error fetching patient details" };
      }
    })
    .get("/", async () => {
      let patients = await db.patient.findMany();
      return patients;
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
          ip_number: t.String(),
          name: t.String(),
          phone_number: t.String(),
          blood_group: bgTypes,
        }),
      }
    )

    .put(
      "/:ip_number",
      async ({ params, body }) => {
        const { ip_number } = params;
        const { name, phone_number, blood_group } = body;
        try {
          const patient = await db.patient.update({
            where: {
              ip_number,
            },
            data: {
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
        const { ip_number } = body;
        const patient = await db.patient.delete({
          where: {
            ip_number,
          },
        });
        return { msg: "Deleted patient", patient };
      },
      {
        body: t.Object({
          ip_number: t.String(),
        }),
      }
    )
);
