-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('Aplus', 'Aminus', 'Bplus', 'Bminus', 'Oplus', 'Ominus', 'ABplus', 'ABminus');

-- CreateTable
CREATE TABLE "Doctor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "blood_group" "BloodGroup" NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);
