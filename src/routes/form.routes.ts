import Elysia, { t } from "elysia";
import { db } from "../db";

export const formRoutes = () => (app: Elysia) =>
  app.group("/form", (app) =>
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
      .get(
        "/form/patient/:pid/time/:time",
        async ({ params }: { params: { pid: string; time: string } }) => {
          const { pid, time } = params;
          return await db.formResponse.findFirst({
            where: {
              patient_id: pid,
              submitted_at: time,
            },
          });
        }
      )
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
  );
