import { BloodGroup } from "@prisma/client";
import { db } from "../db";
import { removeUndefinedValues } from "../../utils/filterObject";

export async function getPatientById({ id }: { id: string }) {
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
}

export async function getAllPatient() {
  return await db.patient.findMany();
}

interface Patient {
  ip_number: string;
  patient_name: string;
  phone_number: string;
  blood_group: BloodGroup;
}

export async function createPatient(new_patient: Patient) {
  const patient = await db.patient.create({
    data: new_patient,
  });
  return { msg: "Created patient", patient };
}

export async function updatePatient(
  { ip_number }: { ip_number: string },
  patient: Record<string, any>
) {
  try {
    const updated_patient = await db.patient.update({
      where: {
        ip_number,
      },
      data: removeUndefinedValues(patient),
    });
    return { msg: "updated user", updated_patient };
  } catch (err: unknown) {
    console.log(`Error occured while updating ${err}`);
  }
}

export async function deletePatient({ ip_number }: { ip_number: string }) {
  const patient = await db.patient.delete({
    where: {
      ip_number,
    },
  });
  return { msg: "Deleted patient", patient };
}
