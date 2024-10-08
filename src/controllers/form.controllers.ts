import { db } from "../db";

export async function getAllForms() {
  return await db.formResponse.findMany();
}

export async function getFormByID(params: { fid: number }) {
  const { fid } = params;
  return await db.formResponse.findFirst({
    where: {
      id: fid,
    },
  });
}

export async function getFormByUserAndTime({
  params,
}: {
  params: { pid: string; time: string };
}) {
  const { pid, time } = params;
  return await db.formResponse.findFirst({
    where: {
      patient_id: pid,
      submitted_at: time,
    },
  });
}

interface MedicalForm {
  patient_id: string;
  submitted_at: string;
  responses : string[]
}

export async function createForm(body: MedicalForm) {
  return await db.formResponse.create({
    data: body,
  });
}

export async function deleteForm(body: { id: number }) {
  const { id } = body;
  return await db.formResponse.delete({
    where: {
      id,
    },
  });
}
