import { removeUndefinedValues } from "../../utils/filterObject";
import { db } from "../db";

export async function getAllMedications() {
  return await db.medication.findMany();
}

export async function getMedicationByID({ id }: { id: number }) {
  return await db.medication.findFirst({
    where: {
      id,
    },
  });
}

export async function getMedicationByPatient(user_id: string) {
  const patient = await db.patient.findUnique({
    where: {
      user_id,
    },
    select: {
      ip_number: true,
    },
  });
  if (patient) {
    return await db.medication.findMany({
      where: {
        patient_id: patient.ip_number,
      },
    });
  } else {
    return {
      msg: "No patient found",
    };
  }
}
interface Medication {
  patient_id: string;
  tablet_name: string;
  notes: string;
  Monday: string[];
  Tuesday: string[];
  Wednesday: string[];
  Thursday: string[];
  Friday: string[];
  Saturday: string[];
  Sunday: string[];
}

export async function createMedication(medication: Medication) {
  return await db.medication.create({
    data: medication,
  });
}

export async function createPrescription({
  prescription,
}: {
  prescription: Medication[];
}) {
  return db.medication.createMany({
    data: prescription,
  });
}

export async function updateMedication(
  { id }: { id: number },
  body: Medication
) {
  return await db.medication.update({
    where: {
      id,
    },
    data: removeUndefinedValues(body),
  });
}

export async function deleteMedication({ id }: { id: number }) {
  try {
    return await db.medication.delete({
      where: {
        id,
      },
    });
  } catch (err: unknown) {
    console.log("Error occured while deleting " + err);
  }
}

export async function deletePrescription({
  patient_id,
}: {
  patient_id: string;
}) {
  try {
    return db.medication.deleteMany({
      where: {
        patient_id,
      },
    });
  } catch (error: unknown) {
    console.log("Error occured while deleting patient medication " + error);
  }
}
