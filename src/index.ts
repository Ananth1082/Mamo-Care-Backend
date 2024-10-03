import { PrismaClient } from "@prisma/client";
import { Elysia, t } from "elysia";
import { bgTypes } from "./types/types";
const db = new PrismaClient();
const app = new Elysia();

app.get("/", () => "Hello Elysia");
app.get("api", () => {
  return { name: "Elysia", version: "1.0.0" };
});
app.get("api/patients", async () => {
  let patients = await db.patient.findMany();
  return patients;
});

app.get("api/patient/:id", async ({ params: { id } }) => {
  return await db.patient.findFirst({
    where: {
      id: id,
    },
  });
});

app.post(
  "/api/patient",
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
);
app.put(
  "/api/patient/:id",
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
);

app.delete(
  "/api/patient",
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
);

app.listen(3000);
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
