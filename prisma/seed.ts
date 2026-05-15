import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import "dotenv/config";

export async function main() {
    // ==== Admin ====
  const admin = await prisma.admin.upsert({
    where: { email: process.env.EMAIL_ADMIN },
    update: {},
    create: {
      name: String(process.env.NAME_ADMIN),
      email: String(process.env.EMAIL_ADMIN),
      password: await bcrypt.hash(process.env.PASSWORD_ADMIN, 10),
    },
  });

  await prisma.place.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Kantor Pusat",
      address: "",
      managerName: String(process.env.NAMA_ADMIN),
      managerPhone: "08123456789", // dummy phone number
      keyLocation: await bcrypt.hash(process.env.KEY_PUSAT, 10),
      operationalJam: "-",
      latitude: -6.2088,
      longitude: 106.8456,
      admin: { connect: { id: admin.id } },
    },
  });

  console.log("Seeding berhasil");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
