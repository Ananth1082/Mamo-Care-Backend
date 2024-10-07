import { PrismaClient } from "@prisma/client";
import Patient from "@prisma/client";

const client = new PrismaClient();
client.$connect;
const doctor = {
  phone_number: "919353798875",
  hospital_name: "KMC Mangalore",
  speciality: "Pediatric",
};
const patients = [
  {
    ip_number: "8bdc3c21-904d-4338-867f-e3e0bead11c1",
    blood_group: "Aplus",
    patient_contacts: ["918187255122"],
  },
  {
    ip_number: "cb53301e-43f3-4541-9ada-2d2a05d0cd3f",
    blood_group: "Bminus",
    patient_contacts: ["918454488496"],
  },
  {
    ip_number: "13ca9f25-6448-4845-9105-910ca0e23737",
    blood_group: "Bplus",
    patient_contacts: ["91982931459"],
  },
  {
    ip_number: "af194886-e9ba-4c72-b39d-339376f4481c",
    blood_group: "ABminus",
    patient_contacts: ["917514646187"],
  },
  {
    ip_number: "f153bdc2-134c-454e-a09a-180f0e21d990",
    blood_group: "Oplus",
    patient_contacts: ["917804675082"],
  },
];
await client.doctor.deleteMany()
await client.patient.deleteMany()

console.log("Creating doctor...");
await client.doctor.create({
  data: doctor,
});

console.log("Creating patients...");

await client.patient.createMany({
  data: patients,
});

client.$disconnect;
