import { logger } from "@tqman/nice-logger";
import { Elysia, t } from "elysia";
import { Patient } from "@prisma/client";
import { bgTypes, Medication } from "./types/types";
//@ts-ignore
import { UserDetail } from "otpless-node-js-auth-sdk";

import { removeUndefinedValues } from "../utils/filterObject";
import { db } from "./db";
import { randomUUID } from "crypto";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import { AppConfig } from "./config";
import middleware from "./middleware";

AppConfig();

// Doctor is created already only need to link with a phone number
new Elysia()
  .use(
    logger({
      mode: "live", // "live" or "combined" (default: "combined")
    })
  )
  .group("/api", (app) =>
    app
      .get("/", () => {
        return {
          message: "pong",
        };
      })
      .group("/auth", (app) =>
        app
          .post(
            "/send-otp",
            async ({ body }) => {
              const { phone_number } = body;
              const orderId = randomUUID();
              const clientID = process.env.OTPLESS_CLIENT_ID;
              const clientSecret = process.env.OTPLESS_CLIENT_SECRET;
              try {
                const sendOTP = await UserDetail.sendOTP(
                  phone_number,
                  "",
                  "SMS",
                  process.env.OTPLESS_HASH,
                  orderId,
                  "60",
                  "5",
                  clientID,
                  clientSecret
                );
                console.log("send otp response:", sendOTP);
                return JSON.stringify(sendOTP);
              } catch (error: unknown) {
                console.error("Error:", JSON.stringify(error));
                return JSON.stringify(error);
              }
            },
            {
              body: t.Object({
                phone_number: t.String(),
              }),
            }
          )
          .post(
            "/verify-otp",
            async ({ body, query }) => {
              const { user, order_id, otp } = body;
              const clientID = process.env.OTPLESS_CLIENT_ID;
              const clientSecret = process.env.OTPLESS_CLIENT_SECRET;
              const { isDoctor } = query;
              try {
                const response = await UserDetail.verifyOTP(
                  "",
                  user.phone_number,
                  order_id,
                  otp,
                  clientID,
                  clientSecret
                );

                if (response.isOTPVerified) {
                  const new_user = await db.user.create({
                    data: user,
                  });

                  if (isDoctor) {
                    const doctor = await db.doctor.update({
                      data: {
                        doctor_id: new_user.id,
                      },
                      where: {
                        phone_number: user.phone_number,
                      },
                    });
                    if (!doctor) {
                      throw new Error("Phone number doesnt belong to a doctor");
                    }
                  }

                  const patient = await db.patient.findFirst({
                    where: {
                      ip_number: user.ip_number,
                    },
                  });
                  if (patient) {
                    await db.patient.update({
                      data: {
                        user_id: new_user.id,
                      },
                      where: {
                        ip_number: user.ip_number,
                      },
                    });
                    const secret = process.env.JWT_SECRET || "secret";
                    const token = sign({ id: new_user.id }, secret);
                    await db.session.create({
                      data: {
                        hashtoken: token,
                        user_id: new_user.id,
                      },
                    });
                    return { otp: response, user: new_user, token: token };
                  } else {
                    throw new Error("Patient not registered ask your doctor");
                  }
                } else {
                  return { otp: response, user: "not created" };
                }
              } catch (error) {
                return error;
              }
            },
            {
              body: t.Object({
                user: t.Object({
                  user_name: t.String(),
                  phone_number: t.String(),
                  ip_number: t.Optional(t.String()),
                }),
                otp: t.String(),
                order_id: t.String(),
              }),
              query: t.Object({
                isDoctor: t.Optional(t.Boolean()),
              }),
            }
          )
          .guard({
            beforeHandle({ headers }) {
              const authHeader = headers["authorization"];
              if (!authHeader) {
                throw new Error("Auth header missing");
              }
              const token = authHeader.split(" ")[1];
              middleware.CheckJWT(token);
            },
          })

          .get("/get-session", async ({ headers }) => {
            const authHeader = headers.authorization;
            if (!authHeader) {
              throw new Error("Unauthorized! enter a token");
            }
            const token = authHeader.split(" ")[1];
            const secret = process.env.JWT_SECRET || "secret";
            let res = verify(token, secret) as JwtPayload;
            const session = db.session.findFirst({
              where: {
                user: {
                  id: res.id,
                },
              },
            });
            return session;
          })
          .get(
            "/logout",
            async ({ headers }) => {
              try {
                const authHeader = headers.authorization;
                if (!authHeader) {
                  throw new Error("Unauthorized! enter a token");
                }
                const token = authHeader.split(" ")[1];
                const secret = process.env.JWT_SECRET || "secret";
                let res = verify(token, secret) as JwtPayload;
                const patient = await db.session.deleteMany({
                  where: {
                    user_id: res["id"] as string,
                    hashtoken: token,
                  },
                });
                console.log(res["id"]);

                return {
                  msg: "Successfully logged out of device",
                  session: patient,
                };
              } catch (error: unknown) {
                throw new Error("Error logging out " + JSON.stringify(error));
              }
            },
            {
              headers: t.Object({
                authorization: t.String(),
              }),
            }
          )
      )
      .group("/patient", (app) =>
        app
          .get("/", async () => {
            let patients = await db.patient.findMany();
            return patients;
          })

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
