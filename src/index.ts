import {  PrismaClient } from "@prisma/client";
import { Elysia } from "elysia";
const db = new PrismaClient();
const app = new Elysia();

app.get("/", () => "Hello Elysia");
app.get("api", () => {
  return { name: "Elysia", version: "1.0.0" };
});
app.get("api/patients",async () => {
  let patients = await db.patient.findMany()
  return patients
});

app.get("api/patient/:id",async ({ params: { id } }) => {
  return await db.patient.findFirst({
    where: {
      id:id
    }
  })
})

app.post("/api/patient",()=> {
  return 
})
app.listen(3000);
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
