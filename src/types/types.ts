import { t } from "elysia";

export const bgTypes = t.Enum({
  "A+": "Aplus",
  "A-": "Aminus",
  "B+": "Bplus",
  "B-": "Bminus",
  "AB+": "ABplus",
  "AB-": "ABminus",
  "O+": "Oplus",
  "O-": "Ominus",
});

export const Medication = t.Object(
  {
    patient_id: t.String(),
    tablet_name: t.String(),
    notes: t.String(),
    Monday: t.Array(t.String()),
    Tuesday: t.Array(t.String()),
    Wednesday: t.Array(t.String()),
    Thursday: t.Array(t.String()),
    Friday: t.Array(t.String()),
    Saturday: t.Array(t.String()),
    Sunday: t.Array(t.String()),
  },
  {
    additionalProperties: false,
  }
);

export const MedicalForm = t.Object({
  patient_id: t.String(),
  submitted_at: t.String(),
  responses : t.Array(t.String()),
});

export const Patient = t.Object({
  ip_number: t.String(),
  patient_name: t.String(),
  blood_group: bgTypes,
});
